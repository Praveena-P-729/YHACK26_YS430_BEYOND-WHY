import math

class SlopeAnalysisService:
    def __init__(self):
        pass

    def evaluate_slope(self, location, pore_pressure: float = 25.0) -> dict:
        slope = getattr(location, 'slope_angle', 35.0) or 35.0
        elevation = getattr(location, 'elevation', 1000.0) or 1000.0
        soil_type = getattr(location, 'soil_type', 'Pore-Saturated Silt') or 'Pore-Saturated Silt'

        # Infinite slope stability approximation: Factor of Safety (FoS)
        friction_angle = 32.0 # degrees
        cohesion = 18.0 # kPa
        gamma_soil = 19.0 # kN/m3
        depth = 2.5 # m slip surface

        # FoS = (c' + (gamma*z*cos^2(beta) - u)*tan(phi)) / (gamma*z*sin(beta)*cos(beta))
        beta_rad = math.radians(max(5.0, slope))
        phi_rad = math.radians(friction_angle)

        normal_stress = gamma_soil * depth * (math.cos(beta_rad) ** 2)
        effective_normal = max(1.0, normal_stress - pore_pressure)
        shear_strength = cohesion + effective_normal * math.tan(phi_rad)
        shear_stress = max(0.5, gamma_soil * depth * math.sin(beta_rad) * math.cos(beta_rad))

        fos = round(shear_strength / shear_stress, 2)

        if fos < 1.05 or slope >= 42.0:
            slope_risk = 'CRITICAL'
            terrain_risk = 'VERY_STEEP_ESCARPMENT'
            advice = 'Imminent slip hazard. Install wire netting and restrict road traffic.'
        elif fos < 1.25 or slope >= 35.0:
            slope_risk = 'HIGH'
            terrain_risk = 'STEEP_SLOPE'
            advice = 'Elevated shear strain. Require periodic inclinometer observation.'
        elif fos < 1.50 or slope >= 25.0:
            slope_risk = 'MEDIUM'
            terrain_risk = 'MODERATE_GRADIENT'
            advice = 'Moderate slope. Maintain stormwater drainage channels.'
        else:
            slope_risk = 'LOW'
            terrain_risk = 'GENTLE_SLOPE'
            advice = 'Stable natural equilibrium.'

        return {
            'hazard_type': 'slope_failure',
            'slope_degrees': round(slope, 1),
            'elevation_m': round(elevation, 1),
            'factor_of_safety': fos,
            'terrain_risk': terrain_risk,
            'slope_failure_risk': slope_risk,
            'soil_lithology': soil_type,
            'structural_advice': advice
        }

slope_service = SlopeAnalysisService()