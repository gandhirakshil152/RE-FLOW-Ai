import asyncio
import json
from httpx import AsyncClient, ASGITransport
from app.main import app


async def test_all_endpoints():
    print("==================================================")
    print("  RE-FLOW AI BACKEND API END-TO-END VERIFICATION  ")
    print("==================================================")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Health Check
        print("\n[1] Testing GET /health...")
        res = await client.get("/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print(f"    Status: {res.status_code} - {res.json()}")

        # 2. Weather Current
        print("\n[2] Testing GET /api/weather/current...")
        res = await client.get("/api/weather/current?latitude=23.2156&longitude=72.6369")
        assert res.status_code == 200, f"Weather current failed: {res.text}"
        data = res.json()
        print(f"    Temp: {data['temperature_c']}°C, Solar Rad: {data['solar_radiation_w_m2']} W/m2, Wind: {data['wind_speed_m_s']} m/s")

        # 3. Weather Forecast
        print("\n[3] Testing GET /api/weather/forecast...")
        res = await client.get("/api/weather/forecast?latitude=23.2156&longitude=72.6369&hours=24")
        assert res.status_code == 200, f"Weather forecast failed: {res.text}"
        data = res.json()
        print(f"    Received {len(data['hourly'])} hourly weather forecast points")

        # 4. Renewable Generation APIs
        print("\n[4] Testing GET /api/renewable/solar, /wind, /forecast...")
        res_s = await client.get("/api/renewable/solar")
        res_w = await client.get("/api/renewable/wind")
        res_f = await client.get("/api/renewable/forecast")
        assert res_s.status_code == 200 and res_w.status_code == 200 and res_f.status_code == 200
        f_data = res_f.json()
        print(f"    Current Solar: {res_s.json()['current_solar_kw']} kW, Wind: {res_w.json()['current_wind_kw']} kW")
        print(f"    Renewable Forecast Points: {len(f_data['forecast'])}, Peak: {f_data['peak_forecast_kw']} kW")

        # 5. Demand APIs
        print("\n[5] Testing GET /api/demand/current, /history, /forecast...")
        res_dc = await client.get("/api/demand/current")
        res_dh = await client.get("/api/demand/history")
        res_df = await client.get("/api/demand/forecast")
        assert res_dc.status_code == 200 and res_dh.status_code == 200 and res_df.status_code == 200
        print(f"    Current Demand: {res_dc.json()['current_demand_kw']} kW, Peak Demand: {res_df.json()['predicted_peak_demand_kw']} kW")

        # 6. Flexible Loads CRUD
        print("\n[6] Testing Flexible Loads API (CRUD)...")
        res_loads = await client.get("/api/loads")
        assert res_loads.status_code == 200
        loads = res_loads.json()
        print(f"    Current loads in DB: {len(loads)}")
        for ld in loads:
            print(f"      - [{ld['priority'].upper()}] {ld['name']}: {ld['power_kw']} kW ({ld['duration_hours']}h) shiftable={ld['shiftable']}")

        # Create new load
        new_ld_payload = {
            "name": "Robotic Welding Cell",
            "power_kw": 110.0,
            "duration_hours": 2,
            "earliest_start": "10:00",
            "latest_end": "15:00",
            "priority": "flexible",
            "shiftable": True
        }
        res_create = await client.post("/api/loads", json=new_ld_payload)
        assert res_create.status_code == 201
        created_id = res_create.json()["id"]
        print(f"    Created load id={created_id}")

        # Update load
        res_update = await client.put(f"/api/loads/{created_id}", json={"power_kw": 120.0})
        assert res_update.status_code == 200
        print(f"    Updated load power to: {res_update.json()['power_kw']} kW")

        # Delete load
        res_del = await client.delete(f"/api/loads/{created_id}")
        assert res_del.status_code == 200
        print(f"    Deleted temporary test load id={created_id}")

        # 7. Combined Forecast API
        print("\n[7] Testing GET /api/forecast...")
        res_fc = await client.get("/api/forecast?hours=24")
        assert res_fc.status_code == 200
        fc_points = res_fc.json()["forecast"]
        print(f"    Combined forecast points: {len(fc_points)}")
        sample_pt = fc_points[12] if len(fc_points) > 12 else fc_points[0]
        print(f"    Sample Point ({sample_pt['time']}): Solar={sample_pt['solar_kw']} kW, Wind={sample_pt['wind_kw']} kW, Demand={sample_pt['demand_kw']} kW, Surplus={sample_pt['surplus_renewable_kw']} kW")

        # 8. Google OR-Tools Optimization API
        print("\n[8] Testing POST /api/optimize (Google OR-Tools MILP)...")
        opt_req = {
            "forecast_hours": 24,
            "peak_demand_weight": 1.0,
            "renewable_weight": 2.0,
            "cost_weight": 1.5
        }
        res_opt = await client.post("/api/optimize", json=opt_req)
        assert res_opt.status_code == 200, f"Optimization failed: {res_opt.text}"
        opt_data = res_opt.json()
        print(f"    Solver Status: {opt_data['solver_status']}")
        print(f"    Estimated Savings: ${opt_data['estimated_savings']}")
        print(f"    Peak Reduction: {opt_data['peak_reduction_percent']}%")
        print(f"    Avoided CO2: {opt_data['avoided_co2_kg']} kg")
        print("    Optimal Schedule:")
        for item in opt_data["recommended_schedule"]:
            print(f"      - {item['load']} [{item['priority']}]: {item['start']} -> {item['end']} ({item['power_kw']} kW)")

        # Verify critical load was NOT shifted
        for item in opt_data["recommended_schedule"]:
            if item["priority"] == "critical":
                assert item["start"] == "00:00", "CRITICAL LOAD SHIFTED! VIOLATION DETECTED!"
                print("    [OK] Safety Check Passed: Critical Server Room was NEVER shifted.")

        # 9. AI Recommendation API
        print("\n[9] Testing POST /api/recommendation...")
        res_rec = await client.post("/api/recommendation", json={})
        assert res_rec.status_code == 200
        rec_data = res_rec.json()
        print(f"    Message: {rec_data['message']}")
        print(f"    Reason:  {rec_data['reason']}")
        print(f"    Savings: ${rec_data['estimated_savings']}, CO2 Avoided: {rec_data['avoided_co2_kg']} kg")

        # 10. What-If Simulator API
        print("\n[10] Testing POST /api/simulator...")
        sim_payload = {
            "additional_load_kw": 700.0,
            "start_time": "19:00",
            "duration_hours": 2
        }
        res_sim = await client.post("/api/simulator", json=sim_payload)
        assert res_sim.status_code == 200
        sim_data = res_sim.json()
        print(f"    Original Peak: {sim_data['original_peak_kw']} kW -> New Peak: {sim_data['new_peak_kw']} kW (+{sim_data['peak_increase_percent']}%)")
        print(f"    Recommended Window: {sim_data['recommended_window']}")
        print(f"    Estimated Savings by Shifting: ${sim_data['estimated_savings']}")
        print(f"    Explanation: {sim_data['explanation']}")

        # 11. Energy Intelligence Score API
        print("\n[11] Testing GET /api/energy-score...")
        res_score = await client.get("/api/energy-score")
        assert res_score.status_code == 200
        score_data = res_score.json()
        print(f"    Score: {score_data['score']}/100 ({score_data['rating']})")
        print(f"    Breakdown: Renewable Alignment={score_data['renewable_alignment']}%, Peak Demand Clipping={score_data['peak_demand_clipping']}%, Scheduling Efficiency={score_data['scheduling_efficiency']}%, Constraint Compliance={score_data['constraint_compliance']}%")

        # 12. Impact API
        print("\n[12] Testing GET /api/impact...")
        res_imp = await client.get("/api/impact")
        assert res_imp.status_code == 200
        imp_data = res_imp.json()
        print(f"    Cost Savings: {imp_data['cost_saving_percent']}%, Peak Reduction: {imp_data['peak_reduction_percent']}%")
        print(f"    Renewable Self-Consumption: {imp_data['renewable_self_consumption_before']}% -> {imp_data['renewable_self_consumption_after']}%")
        print(f"    Avoided CO2: {imp_data['avoided_co2_kg']} kg")

        # 13. Consolidated Dashboard API
        print("\n[13] Testing GET /api/dashboard...")
        res_dash = await client.get("/api/dashboard")
        assert res_dash.status_code == 200
        dash_data = res_dash.json()
        print(f"    Generation: Total={dash_data['current_generation']['total_renewable_kw']} kW")
        print(f"    Demand: Current={dash_data['current_demand']['current_demand_kw']} kW")
        print(f"    Active Loads: {len(dash_data['active_loads'])}")
        print(f"    Forecast Points: {len(dash_data['forecast'])}")
        print(f"    Recommended Actions: {len(dash_data['recommended_actions'])}")
        print(f"    Energy Score: {dash_data['energy_score']['score']}/100")
        print(f"    Impact Savings: {dash_data['impact']['cost_saving_percent']}%")

    print("\n==================================================")
    print("   ALL 13 VERIFICATION TESTS PASSED SUCCESSFULLY! ")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(test_all_endpoints())
