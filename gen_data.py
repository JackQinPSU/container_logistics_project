import csv, random, uuid
from datetime import date, timedelta

random.seed(42)

LOCATIONS = [
    "Port of Los Angeles", "Port of Long Beach", "Port of New York",
    "Port of Savannah", "Port of Houston", "Port of Seattle",
    "Port of Charleston", "Port of Baltimore", "Port of Oakland",
    "Port of Miami"
]
EQUIPMENT_TYPES = ["Dry Van", "Reefer", "Flat Rack", "Open Top", "Tank"]
SIZES = ["20ft", "40ft", "45ft"]
CUSTOMERS = [f"CUST-{str(i).zfill(4)}" for i in range(1, 61)]

def random_date(start_year=2024):
    start = date(start_year, 1, 1)
    return start + timedelta(days=random.randint(0, 364))

rows = []
for _ in range(800):
    eq_id = "CSCU" + str(random.randint(1000000, 9999999))
    eq_type = random.choice(EQUIPMENT_TYPES)
    size = random.choice(SIZES)
    pickup_loc = random.choice(LOCATIONS)
    return_loc = random.choice(LOCATIONS)
    contract_free = random.choice([5, 7, 10, 14])
    daily_rate = round(random.uniform(100, 300), 2)
    customer = random.choice(CUSTOMERS)
    pickup = random_date()

    # ~20% exceed free time, a few large outliers
    r = random.random()
    if r < 0.05:      # ~5% large outliers
        actual_dwell = random.randint(30, 70)
    elif r < 0.20:    # ~15% moderate overage
        actual_dwell = contract_free + random.randint(1, 15)
    else:             # ~80% within free time
        actual_dwell = random.randint(2, contract_free)

    return_d = pickup + timedelta(days=actual_dwell)
    status = "open"

    rows.append({
        "equipment_id": eq_id,
        "equipment_type": eq_type,
        "size": size,
        "pickup_location": pickup_loc,
        "return_location": return_loc,
        "contract_free_days": contract_free,
        "actual_dwell_days": actual_dwell,
        "daily_rate_usd": daily_rate,
        "customer_id": customer,
        "pickup_date": pickup.isoformat(),
        "return_date": return_d.isoformat(),
        "status": status,
    })

fields = list(rows[0].keys())
with open("backend/data/containers.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    w.writerows(rows)

print(f"Generated {len(rows)} rows.")

