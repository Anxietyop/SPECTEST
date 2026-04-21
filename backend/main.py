from fastapi import FastAPI
from pydantic import BaseModel
import requests
from typing import Optional, Dict, Any, List
import yaml
from faker import Faker
from rapidfuzz import fuzz

app = FastAPI()
fake = Faker()

BASE_URL = "https://jsonplaceholder.typicode.com"


# -----------------------------
# 📦 MODELS
# -----------------------------
class TestRequest(BaseModel):
    url: str
    method: str = "GET"
    payload: Optional[Dict[str, Any]] = None


class Field(BaseModel):
    name: str
    required: bool
    type: Optional[str] = None


class Requirement(BaseModel):
    action: str
    entity: str
    fields: List[Field]
    constraints: List[str]
    ambiguities: List[str]


# -----------------------------
# 📄 OPENAPI PARSER
# -----------------------------
def parse_openapi(file_path: str):
    with open(file_path, "r") as f:
        spec = yaml.safe_load(f)

    endpoints = []

    for path, methods in spec.get("paths", {}).items():
        for method, details in methods.items():
            request_body = details.get("requestBody", {})
            content = request_body.get("content", {})
            json_content = content.get("application/json", {})
            schema = json_content.get("schema", {})

            endpoints.append({
                "path": path,
                "method": method.upper(),
                "schema": schema,
                "has_path_param": "{" in path
            })

    return endpoints


# -----------------------------
# 🧠 PAYLOAD GENERATION
# -----------------------------
def generate_payload(schema):
    if not schema:
        return {}

    payload = {}
    for field, details in schema.get("properties", {}).items():
        t = details.get("type", "string")

        if t == "string":
            payload[field] = fake.email() if "email" in field else fake.name()
        elif t == "integer":
            payload[field] = fake.random_int()
        elif t == "boolean":
            payload[field] = True
        else:
            payload[field] = "sample"

    return payload


def generate_negative_payload(schema):
    payload = generate_payload(schema)
    required = schema.get("required", [])

    if required:
        payload.pop(required[0], None)

    return payload


# -----------------------------
# 🔗 CHAINING
# -----------------------------
def extract_id(data):
    if isinstance(data, dict):
        return data.get("id")
    return None


# -----------------------------
# 🔥 SMART MAPPING (UPDATED)
# -----------------------------
def smart_map_to_endpoint(req, endpoints):
    action = req.action.lower()
    entity = req.entity.lower()

    action_map = {
        "create": "POST",
        "add": "POST",
        "register": "POST",
        "update": "PUT",
        "delete": "DELETE",
        "fetch": "GET",
        "get": "GET",
        "retrieve": "GET"
    }

    target_method = action_map.get(action, None)

    best_match = None
    best_score = 0

    for ep in endpoints:
        path = ep["path"].lower()

        score = fuzz.partial_ratio(entity, path)

        if target_method and ep["method"] == target_method:
            score += 20

        if score > best_score:
            best_score = score
            best_match = ep

    if best_score < 50:
        return None

    return best_match


# -----------------------------
# 🔍 SCHEMA COMPARISON
# -----------------------------
def compare_schema(req, schema):
    issues = []

    props = schema.get("properties", {})
    required = schema.get("required", [])

    for field in req.fields:
        if field.name not in props:
            issues.append(f"Field '{field.name}' missing in API")

        if field.required and field.name not in required:
            issues.append(f"Field '{field.name}' should be required")

    return issues


# -----------------------------
# 🚀 TEST ENGINE
# -----------------------------
def run_tests(file_path):
    endpoints = parse_openapi(file_path)
    results = []
    stored = {}

    for ep in endpoints:
        path = ep["path"]

        if ep["has_path_param"]:
            for k, v in stored.items():
                path = path.replace(f"{{{k}}}", str(v))

        url = BASE_URL + path
        method = ep["method"]

        try:
            if method == "GET":
                res = requests.get(url, timeout=5)

                results.append({
                    "endpoint": url,
                    "method": method,
                    "status": res.status_code
                })

            elif method == "POST":
                valid = generate_payload(ep["schema"])
                res_valid = requests.post(url, json=valid)

                invalid = generate_negative_payload(ep["schema"])
                res_invalid = requests.post(url, json=invalid)

                try:
                    data = res_valid.json()
                    stored["id"] = extract_id(data)
                except:
                    pass

                issue = None
                if res_valid.status_code in [200, 201] and res_invalid.status_code < 400:
                    issue = "Required field not enforced"

                results.append({
                    "endpoint": url,
                    "valid_status": res_valid.status_code,
                    "invalid_status": res_invalid.status_code,
                    "issue": issue
                })

        except Exception as e:
            results.append({"error": str(e)})

    return results


# -----------------------------
# 🌐 ROUTES
# -----------------------------
@app.get("/run-all-tests")
def run_all():
    return run_tests("sample_api.yaml")


@app.post("/analyze-requirement")
def analyze(req: Requirement):
    endpoints = parse_openapi("sample_api.yaml")

    ep = smart_map_to_endpoint(req, endpoints)

    if not ep:
        return {"error": "No matching endpoint"}

    schema_issues = compare_schema(req, ep["schema"])
    test_results = run_tests("sample_api.yaml")

    return {
        "mapped_endpoint": ep,
        "schema_issues": schema_issues,
        "test_results": test_results,
        "ambiguities": req.ambiguities
    }