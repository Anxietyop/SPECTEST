from fastapi import FastAPI, Body
import requests
from typing import Dict, Any
from faker import Faker
from rapidfuzz import fuzz

app = FastAPI()
fake = Faker()

BASE_URL = "https://jsonplaceholder.typicode.com"


# -----------------------------
# 🧠 CONVERT OPENAPI → REQUIREMENT
# -----------------------------
def convert_openapi_to_requirement(spec: dict):
    for path, methods in spec.get("paths", {}).items():
        for method, details in methods.items():

            schema = (
                details.get("requestBody", {})
                .get("content", {})
                .get("application/json", {})
                .get("schema", {})
            )

            fields = []
            for name, info in schema.get("properties", {}).items():
                fields.append({
                    "name": name,
                    "required": name in schema.get("required", []),
                    "type": info.get("type")
                })

            return {
                "action": "create" if method.lower() == "post" else "fetch",
                "entity": path.strip("/").split("/")[-1] or "unknown",
                "fields": fields,
                "constraints": [],
                "ambiguities": spec.get("x-ambiguities", [])
            }

    return {
        "action": "fetch",
        "entity": "unknown",
        "fields": [],
        "constraints": [],
        "ambiguities": []
    }


# -----------------------------
# 📄 PARSE ENDPOINTS
# -----------------------------
def convert_spec_to_endpoints(spec: dict):
    endpoints = []

    for path, methods in spec.get("paths", {}).items():
        for method, details in methods.items():

            schema = (
                details.get("requestBody", {})
                .get("content", {})
                .get("application/json", {})
                .get("schema", {})
            )

            endpoints.append({
                "path": path,
                "method": method.upper(),
                "schema": schema,
                "has_path_param": "{" in path
            })

    return endpoints


# -----------------------------
# 🧪 PAYLOAD GENERATION
# -----------------------------
def generate_payload(schema):
    payload = {}

    for field, info in schema.get("properties", {}).items():
        t = info.get("type", "string")

        if t == "string":
            payload[field] = fake.name()
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
# 🔗 SMART MAPPING
# -----------------------------
def smart_map_to_endpoint(req, endpoints):
    best = None
    best_score = 0

    for ep in endpoints:
        score = fuzz.partial_ratio(req["entity"].lower(), ep["path"].lower())

        if req["action"] == "create" and ep["method"] == "POST":
            score += 20

        if score > best_score:
            best_score = score
            best = ep

    if best_score < 50:
        return None

    return best


# -----------------------------
# 🔍 SCHEMA CHECK
# -----------------------------
def compare_schema(req, schema):
    issues = []

    props = schema.get("properties", {})
    required = schema.get("required", [])

    for field in req["fields"]:
        if field["name"] not in props:
            issues.append(f"Field '{field['name']}' missing in API")

        if field["required"] and field["name"] not in required:
            issues.append(f"Field '{field['name']}' should be required")

    return issues


# -----------------------------
# 🚀 SINGLE TEST RUNNER
# -----------------------------
def run_single_endpoint_test(ep):
    url = BASE_URL + ep["path"]
    method = ep["method"]

    try:
        if method == "GET":
            res = requests.get(url, timeout=5)

            return [{
                "endpoint": url,
                "method": method,
                "status": res.status_code,
                "response": res.text[:200]
            }]

        elif method == "POST":
            valid = generate_payload(ep["schema"])
            res_valid = requests.post(url, json=valid)

            invalid = generate_negative_payload(ep["schema"])
            res_invalid = requests.post(url, json=invalid)

            return [{
                "endpoint": url,
                "valid_status": res_valid.status_code,
                "invalid_status": res_invalid.status_code,
                "issue": "Validation test executed"
            }]

    except Exception as e:
        return [{"error": str(e)}]


# -----------------------------
# 🌐 MAIN ENDPOINT (NODE → HERE)
# -----------------------------
@app.post("/auto-analyze")
def auto_analyze(payload: dict = Body(...)):

    print("\n📩 RECEIVED FROM NODE:")
    print(payload)

    spec = payload.get("spec")

    if not spec:
        return {
            "error": "No spec received"
        }

    req = convert_openapi_to_requirement(spec)
    endpoints = convert_spec_to_endpoints(spec)

    ep = smart_map_to_endpoint(req, endpoints)

    if not ep:
        response = {
            "mapped_endpoint": None,
            "schema_issues": [],
            "test_results": [],
            "ambiguities": ["No matching endpoint found"]
        }

        print("🔥 RESPONSE SENT:")
        print(response)
        return response

    schema_issues = compare_schema(req, ep["schema"])
    test_results = run_single_endpoint_test(ep)

    response = {
        "mapped_endpoint": ep,
        "schema_issues": schema_issues,
        "test_results": test_results,
        "ambiguities": req["ambiguities"]
    }

    print("\n🔥 FINAL RESPONSE SENT TO FRONTEND:")
    print(response)

    return response


# -----------------------------
# 🌐 HEALTH CHECK
# -----------------------------
@app.get("/")
def root():
    return {"status": "FastAPI running 🚀"}