from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from typing import Optional, Dict, Any, List
import json
from faker import Faker
from rapidfuzz import fuzz

app = FastAPI()
fake = Faker()

# Enable CORS for Frontend/Node communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_URL = "https://jsonplaceholder.typicode.com"
latest_result = None

# -----------------------------
# 📦 MODELS
# -----------------------------
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
# 📄 LOGIC HELPERS
# -----------------------------

def convert_spec_to_endpoints(spec: dict):
    endpoints = []
    paths = spec.get("paths", {})
    for path, methods in paths.items():
        for method, details in methods.items():
            content = details.get("requestBody", {}).get("content", {})
            schema = content.get("application/json", {}).get("schema", {})

            endpoints.append({
                "path": path,
                "method": method.upper(),
                "schema": schema or {},
                "has_path_param": "{" in path
            })
    return endpoints

def generate_payload(schema):
    if not schema: return {}
    payload = {}
    properties = schema.get("properties", {})
    for field, details in properties.items():
        t = details.get("type", "string")
        if t == "string":
            payload[field] = fake.email() if "email" in field.lower() else fake.name()
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

def smart_map_to_endpoint(req: Requirement, endpoints):
    action_map = {
        "create": "POST", "add": "POST", "register": "POST",
        "update": "PUT", "delete": "DELETE",
        "fetch": "GET", "get": "GET", "retrieve": "GET"
    }
    target_method = action_map.get(req.action.lower(), "GET")
    
    best_match = None
    best_score = 0

    for ep in endpoints:
        score = fuzz.partial_ratio(req.entity.lower(), ep["path"].lower())
        if ep["method"] == target_method:
            score += 20
        if score > best_score:
            best_score = score
            best_match = ep

    return best_match if best_score >= 50 else None

def compare_schema(req: Requirement, schema):
    issues = []
    props = schema.get("properties", {})
    required_in_api = schema.get("required", [])

    for field in req.fields:
        if field.name not in props:
            issues.append(f"Field '{field.name}' missing in API")
        if field.required and field.name not in required_in_api:
            issues.append(f"Field '{field.name}' should be required")
    return issues

def run_specific_test(ep):
    url = BASE_URL + ep["path"]
    method = ep["method"]
    results = []

    try:
        # 1. Health Check (GET)
        res_get = requests.get(url, timeout=5)
        results.append({
            "endpoint": url,
            "method": "GET",
            "status": res_get.status_code
        })

        # 2. Functional Check (POST/PUT)
        if method == "POST":
            valid = generate_payload(ep["schema"])
            res_v = requests.post(url, json=valid)
            
            invalid = generate_negative_payload(ep["schema"])
            res_i = requests.post(url, json=invalid)
            
            issue = "Validation test executed"
            # If server returns 201/200 for a payload missing required fields
            if res_i.status_code < 400 and ep["schema"].get("required"):
                issue = "Required field not enforced"

            results.append({
                "endpoint": url,
                "valid_status": res_v.status_code,
                "invalid_status": res_i.status_code,
                "issue": issue
            })
    except Exception as e:
        results.append({"error": str(e)})
    
    return results

# -----------------------------
# 🌐 ROUTES
# -----------------------------

@app.post("/auto-analyze")
def auto_analyze(payload: dict = Body(...)):
    global latest_result
    print("🔥 AUTO-ANALYZE TRIGGERED")

    # Extract data
    spec = payload.get("spec")
    requirements_list = payload.get("requirements", [])
    print("SPEC:", spec)
    print("REQ COUNT:", len(requirements_list))
    
    if not spec:
        return {"error": "No spec received"}
    
    if not requirements_list:
        # Fallback to single 'requirement' if 'requirements' list is missing
        single_req = payload.get("requirement")
        if single_req:
            requirements_list = [single_req]
        else:
            return {"error": "No requirements received"}

    # Parse spec if string
    if isinstance(spec, str):
        try:
            spec = json.loads(spec)
        except:
            return {"error": "Invalid JSON spec"}

    endpoints = convert_spec_to_endpoints(spec)
    all_results = []

    # Iterate through each requirement
    for req_data in requirements_list:
        try:
            # Ensure required fields exist in req_data
            if "constraints" not in req_data: req_data["constraints"] = []
            if "ambiguities" not in req_data: req_data["ambiguities"] = []
            
            req_model = Requirement(**req_data)
            ep = smart_map_to_endpoint(req_model, endpoints)

            if not ep:
                all_results.append({
                    "entity": req_model.entity,
                    "error": "No matching endpoint found",
                    "ambiguities": req_model.ambiguities
                })
                continue

            schema_issues = compare_schema(req_model, ep["schema"])
            test_results = run_specific_test(ep)

            all_results.append({
                "entity": req_model.entity,
                "mapped_endpoint": ep,
                "schema_issues": schema_issues,
                "test_results": test_results,
                "ambiguities": req_model.ambiguities
            })
        except Exception as e:
            all_results.append({
                "entity": req_data.get("entity", "Unknown"),
                "error": f"Processing error: {str(e)}"
            })

    latest_result = all_results
    print(f"\n🔥 PROCESSED {len(all_results)} REQUIREMENTS")
    return all_results

@app.get("/auto-analyze/result")
def get_last_result():
    if latest_result is None:
        return {"error": "No result available yet"}
    return latest_result

@app.get("/")
def root():
    return {"status": "FastAPI Batch Logic Engine running 🚀"}