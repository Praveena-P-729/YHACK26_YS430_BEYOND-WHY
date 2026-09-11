class MultiHazardEngine:
    def __init__(self):
        pass

    def evaluate_multi_hazard(self, landslide_data: dict, flood_data: dict, slope_data: dict, road_data: dict, community_data: dict) -> dict:
        ls_prob = landslide_data.get('risk_probability', 50.0)
        fl_prob = flood_data.get('risk_probability', 40.0)
        slope_risk = slope_data.get('slope_failure_risk', 'MEDIUM')
        road_impact = road_data.get('impact_level', 'MEDIUM')
        community_risk = community_data.get('accessibility_status', 'ACCESSIBLE')

        # Decision matrix rule
        if ls_prob >= 80.0 or fl_prob >= 80.0 or slope_risk == 'CRITICAL' or road_impact == 'CRITICAL':
            overall_status = 'CRITICAL'
            summary = 'Multi-hazard alert: Severe combined threat of slope failure, torrential runoff, and road arterial blockage.'
        elif ls_prob >= 60.0 or fl_prob >= 60.0 or slope_risk == 'HIGH' or road_impact == 'HIGH':
            overall_status = 'HIGH'
            summary = 'High compound risk: Elevated rainfall saturation threatening steep slope equilibrium and transit corridors.'
        elif ls_prob >= 35.0 or fl_prob >= 35.0 or slope_risk == 'MEDIUM':
            overall_status = 'MEDIUM'
            summary = 'Advisory watch: Moderate precipitation accumulation and minor localized surface runoff.'
        else:
            overall_status = 'LOW'
            summary = 'Stable environmental baselines with normal transit access.'

        return {
            'landslide_risk': round(ls_prob, 1),
            'flood_risk': round(fl_prob, 1),
            'slope_risk': slope_risk,
            'road_impact': road_impact,
            'community_risk': community_risk,
            'overall_status': overall_status,
            'summary_evaluation': summary
        }

multi_hazard_engine = MultiHazardEngine()