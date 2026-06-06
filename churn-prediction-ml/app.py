from flask import Flask, request, jsonify
import joblib
import pandas as pd
import shap
import numpy as np

app = Flask(__name__)

# ==============================================================================
# 1. LOAD ASSETS AT STARTUP
# ==============================================================================
# Loading these once globally keeps the API stateless and fast (< 2 seconds)
try:
    model = joblib.load('xgboost_churn_model.pkl')
    feature_names = joblib.load('model_features.pkl')
    
    # Initialize SHAP explainer globally. 
    # Note: For XGBoost, TreeExplainer returns a single 2D array of SHAP values, 
    # unlike Random Forest which returns a list of arrays.
    explainer = shap.TreeExplainer(model)
    print("Model and SHAP Explainer loaded successfully.")
except Exception as e:
    print(f"Error loading assets: {e}")

# Apply the optimal threshold you found for XGBoost in the notebook (e.g., 0.59)
# We prioritize this threshold to maximize RECALL.
XGB_THRESHOLD = 0.59 


# ==============================================================================
# 2. DEFINE THE PREDICTION ENDPOINT
# ==============================================================================
@app.route('/predict', methods=['POST'])
def get_prediction():
    try:
        # Get customer data from the Express.js backend request
        incoming_data = request.json
        
        # Convert JSON to a DataFrame and ensure it has the exact columns the model expects
        # Any missing columns will be filled with 0 (useful for one-hot encoded variables)
        df = pd.DataFrame([incoming_data])
        df = df.reindex(columns=feature_names, fill_value=0)
        
        # --- PREDICTION ---
        # predict_proba returns [[prob_class_0, prob_class_1]]
        churn_prob = float(model.predict_proba(df)[0][1])
        
        # Determine Risk Level based on your Recall-optimized threshold
        risk_level = "HIGH" if churn_prob >= XGB_THRESHOLD else "LOW"
        
        # --- EXPLAINABLE AI (SHAP) ---
        # Calculate SHAP values for this specific customer
        shap_values = explainer.shap_values(df)
        customer_shap = shap_values[0] # Extract the 1D array for this single customer
        
        # Create a dictionary mapping feature names to their SHAP values
        shap_dict = [{'feature': f, 'shap_value': float(s)} for f, s in zip(feature_names, customer_shap)]
        
        # Sort by absolute magnitude to find the features with the BIGGEST impact (positive or negative)
        shap_dict.sort(key=lambda x: abs(x['shap_value']), reverse=True)
        
        # Extract the top 2 factors and apply the dynamic direction logic
        top_factors = []
        for item in shap_dict[:2]:
            direction = "increases_risk" if item['shap_value'] > 0 else "decreases_risk"
            top_factors.append({
                "feature": item['feature'],
                "shap_value": round(item['shap_value'], 4),
                "direction": direction
            })
        
        # --- RETURN RESPONSE ---
        return jsonify({
            "churn_probability": round(churn_prob, 4),
            "risk_level": risk_level,
            "top_factors": top_factors
        }), 200

    except Exception as e:
        return jsonify({"error": str(e), "message": "Failed to process prediction."}), 400


# ==============================================================================
# 3. RUN THE SERVER
# ==============================================================================
if __name__ == '__main__':
    # Run on port 5000 (standard for Flask), Express will likely run on 3000 or 8080
    app.run(host='0.0.0.0', port=5000, debug=True)