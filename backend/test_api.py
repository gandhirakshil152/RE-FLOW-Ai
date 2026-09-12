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

        # 14. ML Model Metrics API
        print("\n[14] Testing GET /api/ml/metrics...")
        res_ml = await client.get("/api/ml/metrics")
        assert res_ml.status_code == 200
        ml_data = res_ml.json()
        print(f"    Model: {ml_data['model_name']} ({ml_data['algorithm']})")
        print(f"    Accuracy: Overall R²={ml_data['overall_r2']}, Solar R²={ml_data['solar_r2']}, Demand R²={ml_data['demand_r2']}")
        print(f"    Error: MAE={ml_data['mae_kw']} kW, RMSE={ml_data['rmse_kw']} kW")
        print(f"    Top Feature: {ml_data['feature_importances'][0]['feature']} ({ml_data['feature_importances'][0]['importance'] * 100}%)")

        # 15. ML Probabilistic Forecast API (with P10 - P90 Uncertainty Bands)
        print("\n[15] Testing GET /api/ml/forecast...")
        res_ml_f = await client.get("/api/ml/forecast?hours=24")
        assert res_ml_f.status_code == 200
        ml_f_data = res_ml_f.json()
        sample_pt = ml_f_data['forecast'][12]  # Midday
        print(f"    Forecast points: {len(ml_f_data['forecast'])}, Surplus Window: {ml_f_data['surplus_window']}")
        print(f"    Midday (12:00) Solar ML Prediction: {sample_pt['solar_predicted_kw']} kW [P10: {sample_pt['solar_p10_kw']} kW, P90: {sample_pt['solar_p90_kw']} kW]")
        print(f"    Midday Demand ML Prediction: {sample_pt['demand_predicted_kw']} kW [P10: {sample_pt['demand_p10_kw']} kW, P90: {sample_pt['demand_p90_kw']} kW]")
        assert sample_pt['solar_p10_kw'] <= sample_pt['solar_predicted_kw'] <= sample_pt['solar_p90_kw']

        # 16. ML Real-Time Anomaly Detection API
        print("\n[16] Testing GET /api/ml/anomalies...")
        res_anom = await client.get("/api/ml/anomalies")
        assert res_anom.status_code == 200
        anom_data = res_anom.json()
        print(f"    Total Anomalies Detected: {anom_data['total_anomalies']} (Critical: {anom_data['critical_count']})")
        print(f"    Grid Stability Index: {anom_data['grid_stability_index']}%")
        if anom_data['anomalies']:
            top = anom_data['anomalies'][0]
            print(f"    Sample Anomaly: [{top['severity'].upper()}] {top['title']} (Score: {top['score']})")

        # 17. Explainable AI (XAI) Copilot API
        print("\n[17] Testing POST /api/ml/ask & GET /api/ml/explain...")
        res_ask = await client.post("/api/ml/ask", json={"query": "Why was the EV fleet moved to 1:00 PM?"})
        assert res_ask.status_code == 200
        copilot_data = res_ask.json()
        print(f"    Copilot Source: {copilot_data['source']}, Confidence: {copilot_data['model_confidence'] * 100}%")
        print(f"    Answer: {copilot_data['answer'][:120]}...")
        print(f"    Action: {copilot_data['suggested_actions'][0]}")

        res_exp = await client.get("/api/ml/explain")
        assert res_exp.status_code == 200

        # 18. Clean Energy Locations API
        print("\n[18] Testing GET /api/ml/locations...")
        res_loc = await client.get("/api/ml/locations")
        assert res_loc.status_code == 200
        locs = res_loc.json()
        print(f"    Available Clean Tech Hubs: {len(locs)}")
        for l in locs:
            print(f"      - {l['name']} ({l['region']}): Solar={l['solar_capacity_kw']} kW, Wind={l['wind_capacity_kw']} kW")

        # 19. Live Satellite Model Retraining API
        print("\n[19] Testing POST /api/ml/retrain on real Open-Meteo satellite feed...")
        res_retrain = await client.post("/api/ml/retrain", json={"past_days": 7, "location_name": "Gandhinagar Clean Tech Corridor"})
        assert res_retrain.status_code == 200
        retrain_data = res_retrain.json()
        print(f"    Status: {retrain_data['status']}")
        print(f"    Source: {retrain_data['data_source']}")
        print(f"    Samples Used: {retrain_data['samples_used']} real hourly records (Duration: {retrain_data['training_duration_ms']} ms)")
        print(f"    Updated Model Accuracy: Overall R²={retrain_data['overall_r2']}, Solar R²={retrain_data['solar_r2']}, Demand R²={retrain_data['demand_r2']}")
        print(f"    Loss Convergence: {retrain_data['loss_history'][0]} -> {retrain_data['loss_history'][-1]}")

    print("\n==================================================")
    print("   ALL 19 VERIFICATION TESTS PASSED SUCCESSFULLY! ")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(test_all_endpoints())



    print("\n==================================================")
    print("   ALL 19 VERIFICATION TESTS PASSED SUCCESSFULLY! ")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(test_all_endpoints())


