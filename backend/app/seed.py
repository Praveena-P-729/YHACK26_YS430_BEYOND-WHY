import datetime
from app.database import SessionLocal, Base, engine
from app.models.models import (
    User, Location, SensorReading, Prediction, Alert, 
    Incident, EvacuationShelter, HistoricalLandslide, ThresholdConfig
)
from app.services.auth_service import get_password_hash

def seed_database():
    print("Creating all tables in database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Seed Users (Citizen, Field Officer, Admin)
    if db.query(User).count() == 0:
        print("Seeding initial RBAC user profiles...")
        users = [
            User(
                full_name="Praveena",
                email="praveena@landguard.ai",
                phone="+91 94432 98765",
                password_hash=get_password_hash("Praveena@2026"),
                role="field_officer",
                badge_number="NER-CMD-729",
                department="North-Eastern Regional Disaster Management Authority (NER-SDMA)",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
                is_active=True,
                created_at=datetime.datetime.utcnow(),
                last_login_at=datetime.datetime.utcnow()
            ),
            User(
                full_name="Praveena",
                email="citizen@landguard.ai",
                phone="+91 98401 99887",
                password_hash=get_password_hash("Citizen@2026"),
                role="citizen",
                department="North-Eastern Resident Community & Hill Panchayat",
                avatar_url="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150",
                is_active=True,
                created_at=datetime.datetime.utcnow(),
                last_login_at=datetime.datetime.utcnow()
            ),
            User(
                full_name="Major Vikramaditya Rathore",
                email="officer@landguard.ai",
                phone="+91 94432 98765",
                password_hash=get_password_hash("Officer@2026"),
                role="field_officer",
                badge_number="NER-DISASTER-108",
                department="North-Eastern Regional Disaster Management Authority (NER-SDMA)",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
                is_active=True,
                created_at=datetime.datetime.utcnow(),
                last_login_at=datetime.datetime.utcnow()
            ),
            User(
                full_name="Dr. Rajeshwari Sundaram",
                email="admin@landguard.ai",
                phone="+91 98401 23456",
                password_hash=get_password_hash("Admin@2026"),
                role="admin",
                badge_number="NDMA-CMD-001",
                department="National Disaster Management Authority (NDMA)",
                avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
                is_active=True,
                created_at=datetime.datetime.utcnow(),
                last_login_at=datetime.datetime.utcnow()
            )
        ]
        db.add_all(users)
        db.commit()

    # 2. Seed Locations & Stations (North-Eastern Region of India)
    if db.query(Location).count() == 0:
        print("Seeding North-Eastern Region landslide & flood monitoring stations...")
        locations_data = [
            {"name": "Guwahati - Khanapara Escarpment (NH-27)", "region": "Kamrup Metro", "state": "Assam", "latitude": 26.1158, "longitude": 91.8025, "elevation": 120, "slope_angle": 28.5, "soil_type": "Lateritic Clay", "current_risk_level": "Moderate", "current_risk_score": 52.0},
            {"name": "Shillong Ridge - Umiam Corridor (NH-6)", "region": "East Khasi Hills", "state": "Meghalaya", "latitude": 25.5788, "longitude": 91.8933, "elevation": 1496, "slope_angle": 39.5, "soil_type": "Pore-Saturated Silt", "current_risk_level": "Severe", "current_risk_score": 84.5},
            {"name": "Cherrapunji / Sohra Cliff Pass", "region": "East Khasi Hills", "state": "Meghalaya", "latitude": 25.2702, "longitude": 91.7323, "elevation": 1484, "slope_angle": 44.0, "soil_type": "Fractured Sandstone Colluvium", "current_risk_level": "Severe", "current_risk_score": 92.4},
            {"name": "Noney Railway Cutting (NH-37 Corridor)", "region": "Noney", "state": "Manipur", "latitude": 24.8100, "longitude": 93.6000, "elevation": 820, "slope_angle": 42.5, "soil_type": "Shale Colluvium", "current_risk_level": "Severe", "current_risk_score": 88.0},
            {"name": "Kohima Bypass - Zubza Pass (NH-29)", "region": "Kohima", "state": "Nagaland", "latitude": 25.6751, "longitude": 94.1086, "elevation": 1444, "slope_angle": 37.0, "soil_type": "Gravelly Loam", "current_risk_level": "High", "current_risk_score": 74.2},
            {"name": "Aizawl Saron Veng Slump Zone", "region": "Aizawl", "state": "Mizoram", "latitude": 23.7271, "longitude": 92.7176, "elevation": 1132, "slope_angle": 38.0, "soil_type": "Siltstone Saprolite", "current_risk_level": "High", "current_risk_score": 78.5},
            {"name": "Gangtok - Deorali Sinking Corridor (NH-10)", "region": "East Sikkim", "state": "Sikkim", "latitude": 27.3389, "longitude": 88.6065, "elevation": 1650, "slope_angle": 41.0, "soil_type": "Mica Schist Silt", "current_risk_level": "Severe", "current_risk_score": 86.7},
            {"name": "Itanagar - Pappu Nallah Valley (NH-415)", "region": "Papum Pare", "state": "Arunachal Pradesh", "latitude": 27.0844, "longitude": 93.6053, "elevation": 320, "slope_angle": 33.5, "soil_type": "Red Forest Loam", "current_risk_level": "High", "current_risk_score": 68.4},
            {"name": "Tawang Mountain Pass Highway", "region": "Tawang", "state": "Arunachal Pradesh", "latitude": 27.5861, "longitude": 91.8594, "elevation": 3048, "slope_angle": 45.0, "soil_type": "Fractured Quartzite", "current_risk_level": "High", "current_risk_score": 72.0},
            {"name": "Silchar - Haflong Ghat Link (Dima Hasao)", "region": "Dima Hasao", "state": "Assam", "latitude": 25.1700, "longitude": 93.0200, "elevation": 513, "slope_angle": 36.0, "soil_type": "Pore-Saturated Silt", "current_risk_level": "Severe", "current_risk_score": 89.0},
            {"name": "Jampui Hills Ridge Corridor", "region": "North Tripura", "state": "Tripura", "latitude": 23.9500, "longitude": 92.2700, "elevation": 930, "slope_angle": 30.0, "soil_type": "Sandy Clay Loam", "current_risk_level": "Moderate", "current_risk_score": 46.5},
            {"name": "Mangan - Chungthang North Axis", "region": "North Sikkim", "state": "Sikkim", "latitude": 27.5000, "longitude": 88.6100, "elevation": 1780, "slope_angle": 43.0, "soil_type": "Phyllite Debris", "current_risk_level": "Severe", "current_risk_score": 91.0}
        ]

        for ld in locations_data:
            loc = Location(**ld)
            db.add(loc)
            db.commit()
            db.refresh(loc)

            # Add sensor reading
            reading = SensorReading(
                location_id=loc.id,
                rainfall_1h=38.5 if loc.current_risk_score > 70 else 8.5,
                rainfall_24h=162.0 if loc.current_risk_score > 70 else 42.0,
                rainfall_72h=310.0 if loc.current_risk_score > 70 else 85.0,
                pore_pressure=36.4 if loc.current_risk_score > 70 else 14.5,
                soil_moisture=78.0 if loc.current_risk_score > 70 else 38.0,
                tilt_x=1.8 if loc.current_risk_score > 70 else 0.1,
                tilt_y=-1.2 if loc.current_risk_score > 70 else 0.05,
                displacement_rate=7.4 if loc.current_risk_score > 70 else 0.4,
                vibration_level=0.09 if loc.current_risk_score > 70 else 0.01,
                temperature=21.0,
                humidity=92.0,
                sensor_battery=97.0,
                sensor_status="CRITICAL" if loc.current_risk_score > 80 else "NORMAL"
            )
            db.add(reading)

            # Add prediction
            pred = Prediction(
                location_id=loc.id,
                risk_score=loc.current_risk_score,
                risk_level=loc.current_risk_level,
                confidence=0.94,
                forecast_horizon="Now",
                primary_driver="Torrential Monsoon Inflow & Subsurface Pore Pressure",
                factor_contributions={
                    "Antecedent Rainfall (ARI & 15-Day Lag)": 44.2,
                    "Hydrostatic Pore Pressure": 26.8,
                    "Topographic Slope & Elevation": 18.5,
                    "Geological Lithology & Forest Cover": 10.5
                }
            )
            db.add(pred)

        db.commit()

    # 3. Seed Evacuation Shelters (North-Eastern Region)
    if db.query(EvacuationShelter).count() == 0:
        print("Seeding North-Eastern Region public evacuation relief camps...")
        shelters = [
            EvacuationShelter(
                name="Guwahati Sarusajai Emergency Disaster Relief Center",
                region="Kamrup Metro",
                address="National Highway 27, Lokhra, Guwahati, Assam - 781034",
                latitude=26.1158,
                longitude=91.7525,
                capacity=1200,
                current_occupancy=140,
                contact_phone="1077 / 0361-2237000",
                status="OPEN",
                medical_facility=True,
                food_supply_days=14
            ),
            EvacuationShelter(
                name="Shillong JN Stadium Indoor Emergency Base Camp",
                region="East Khasi Hills",
                address="Polo Grounds, Shillong, Meghalaya - 793001",
                latitude=25.5850,
                longitude=91.8900,
                capacity=850,
                current_occupancy=210,
                contact_phone="0364-2224010",
                status="OPEN",
                medical_facility=True,
                food_supply_days=10
            ),
            EvacuationShelter(
                name="Cherrapunji Govt Higher Secondary Relief Hall",
                region="East Khasi Hills",
                address="Sohra Bazar, Cherrapunji, Meghalaya - 793108",
                latitude=25.2702,
                longitude=91.7323,
                capacity=500,
                current_occupancy=95,
                contact_phone="03637-234201",
                status="OPEN",
                medical_facility=True,
                food_supply_days=12
            ),
            EvacuationShelter(
                name="Noney Community District Disaster Center",
                region="Noney",
                address="Longmai Town Center, Noney, Manipur - 795159",
                latitude=24.8100,
                longitude=93.6000,
                capacity=600,
                current_occupancy=180,
                contact_phone="0387-223401",
                status="OPEN",
                medical_facility=True,
                food_supply_days=8
            ),
            EvacuationShelter(
                name="Gangtok Paljor Stadium Emergency Shelter",
                region="East Sikkim",
                address="Paljor Stadium Road, Gangtok, Sikkim - 737101",
                latitude=27.3389,
                longitude=88.6065,
                capacity=900,
                current_occupancy=120,
                contact_phone="03592-202200",
                status="OPEN",
                medical_facility=True,
                food_supply_days=14
            )
        ]
        db.add_all(shelters)
        db.commit()

    # 4. Seed Alerts (North-Eastern Region)
    if db.query(Alert).count() == 0:
        print("Seeding active North-Eastern early warning alerts...")
        alerts = [
            Alert(
                location_id=2,
                location_name="Shillong Ridge - Umiam Corridor (NH-6)",
                hazard_type="LANDSLIDE",
                alert_level="CRITICAL",
                title="STAGE-3 WARNING: Shillong Ridge NH-6 Slope Failure",
                message="Subsurface tilt meters detect 7.4 mm/day downslope shear accompanied by 162mm 24-hr rainfall. NH-6 lane closed between km 38-42.",
                recommended_action="Suspend commercial heavy transport. Pre-position NDRF 1st Battalion at Nongpoh checkpost.",
                status="ACTIVE",
                is_active=True
            ),
            Alert(
                location_id=3,
                location_name="Cherrapunji / Sohra Cliff Pass",
                hazard_type="FLASH_FLOOD",
                alert_level="CRITICAL",
                title="FLASH FLOOD & DEBRIS FLOW: Sohra Rim Escarpment",
                message="Pore water pressure exceeds critical safety threshold (36.4 kPa). Stream runoff volume 340% above normal.",
                recommended_action="Immediate evacuation of 120 households along stream basin to Cherrapunji Relief Hall.",
                status="ACTIVE",
                is_active=True
            ),
            Alert(
                location_id=4,
                location_name="Noney Railway Cutting (NH-37 Corridor)",
                hazard_type="ROAD_BLOCKAGE",
                alert_level="HIGH",
                title="ROAD BLOCKAGE WARNING: NH-37 Noney Colluvium Slump",
                message="Mud and rock debris accumulation blocking Imphal-Silchar highway arterial at milestone 44.",
                recommended_action="Deploy JCB earth-movers from Noney depot. Divert light vehicles via Leimatak bypass.",
                status="INVESTIGATING",
                is_active=True
            )
        ]
        db.add_all(alerts)
        db.commit()

    # 5. Seed Initial Weather Observations
    from app.models.models import WeatherObservation
    if db.query(WeatherObservation).count() == 0:
        print("Seeding baseline weather observations for North-Eastern Region...")
        obs = [
            WeatherObservation(
                latitude=25.5788,
                longitude=91.8933,
                location_name="Shillong Sector (East Khasi Hills)",
                rainfall=18.5,
                rainfall_1h=18.5,
                rainfall_3h=46.0,
                rainfall_6h=82.0,
                rainfall_12h=124.0,
                rainfall_24h=162.0,
                rainfall_intensity=18.5,
                rainfall_trend="RISING",
                temperature=19.4,
                humidity=94.0,
                wind_speed=14.2,
                observed_at=datetime.datetime.utcnow()
            ),
            WeatherObservation(
                latitude=26.1158,
                longitude=91.8025,
                location_name="Guwahati Basin (Kamrup Metro)",
                rainfall=12.0,
                rainfall_1h=12.0,
                rainfall_3h=28.0,
                rainfall_6h=52.0,
                rainfall_12h=84.0,
                rainfall_24h=110.0,
                rainfall_intensity=12.0,
                rainfall_trend="STEADY",
                temperature=25.6,
                humidity=86.0,
                wind_speed=11.0,
                observed_at=datetime.datetime.utcnow()
            )
        ]
        db.add_all(obs)
        db.commit()

    print("Database seeding for North-Eastern Region completed successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()
