class RoadNetworkService:
    def __init__(self):
        self.ne_highways = [
            {'name': 'NH-6 (Guwahati - Shillong - Silchar Expressway)', 'type': 'Primary National Highway', 'criticality': 'CRITICAL'},
            {'name': 'NH-27 (East-West Corridor / Assam Valley)', 'type': 'Primary Arterial', 'criticality': 'HIGH'},
            {'name': 'NH-29 (Dimapur - Kohima Highway)', 'type': 'Primary Mountain Corridor', 'criticality': 'CRITICAL'},
            {'name': 'NH-37 (Silchar - Imphal via Noney)', 'type': 'Critical Supply Highway', 'criticality': 'CRITICAL'},
            {'name': 'NH-10 (Sevoke - Gangtok Highway)', 'type': 'Primary Mountain Lifeline', 'criticality': 'CRITICAL'},
            {'name': 'NH-415 (Banderdewa - Itanagar Link)', 'type': 'State Capital Arterial', 'criticality': 'HIGH'},
            {'name': 'SH-12 (Cherrapunji - Shella Escarpment)', 'type': 'Secondary Ghat Pass', 'criticality': 'HIGH'}
        ]

    def analyze_road_impact(self, location, risk_score: float = 75.0) -> dict:
        loc_name = getattr(location, 'name', '') if location else ''
        if 'Shillong' in loc_name or 'Umiam' in loc_name:
            nearest_road = 'NH-6 (Shillong - Guwahati Expressway km 42)'
            distance_m = 120
            road_type = 'Primary National Highway'
        elif 'Noney' in loc_name or 'Manipur' in loc_name:
            nearest_road = 'NH-37 (Noney Colluvium Cutting km 44)'
            distance_m = 85
            road_type = 'Primary Supply Highway'
        elif 'Kohima' in loc_name or 'Nagaland' in loc_name:
            nearest_road = 'NH-29 (Kohima Bypass / Zubza Pass)'
            distance_m = 160
            road_type = 'Primary Mountain Highway'
        elif 'Gangtok' in loc_name or 'Sikkim' in loc_name:
            nearest_road = 'NH-10 (Deorali Sinking Zone km 18)'
            distance_m = 95
            road_type = 'Mountain Lifeline'
        elif 'Cherrapunji' in loc_name:
            nearest_road = 'SH-12 (Sohra Cliff Rim Pass)'
            distance_m = 140
            road_type = 'Regional Mountain Link'
        else:
            nearest_road = 'NH-27 (North-East Valley Corridor)'
            distance_m = 220
            road_type = 'National Arterial'

        if risk_score >= 80.0:
            impact_level = 'CRITICAL'
            status = 'BLOCKED / IMPASSABLE'
            closure_reason = 'Active slope slump and debris flow across both lanes.'
        elif risk_score >= 60.0:
            impact_level = 'HIGH'
            status = 'RESTRICTED (Single-Lane Escort)'
            closure_reason = 'Rockfall spillage and tension crack expansion on road shoulder.'
        elif risk_score >= 35.0:
            impact_level = 'MEDIUM'
            status = 'OPEN (Advisory Watch)'
            closure_reason = 'Pavement seepage and minor gravel debris.'
        else:
            impact_level = 'LOW'
            status = 'OPEN'
            closure_reason = 'Normal vehicular flow.'

        return {
            'nearest_road': nearest_road,
            'distance_m': distance_m,
            'road_type': road_type,
            'impact_level': impact_level,
            'road_status': status,
            'closure_reason': closure_reason
        }

    def analyze_infrastructure_impact(self, location, risk_score: float = 75.0) -> dict:
        if risk_score >= 80.0:
            overall = 'CRITICAL'
            roads = 4
            bridges = 2
            settlements = 3
            hospitals = 1
            schools = 2
        elif risk_score >= 60.0:
            overall = 'HIGH'
            roads = 3
            bridges = 1
            settlements = 2
            hospitals = 0
            schools = 1
        elif risk_score >= 35.0:
            overall = 'MEDIUM'
            roads = 1
            bridges = 0
            settlements = 1
            hospitals = 0
            schools = 0
        else:
            overall = 'LOW'
            roads = 0
            bridges = 0
            settlements = 0
            hospitals = 0
            schools = 0

        return {
            'roads_at_risk': roads,
            'bridges_at_risk': bridges,
            'settlements_at_risk': settlements,
            'hospitals_at_risk': hospitals,
            'schools_at_risk': schools,
            'overall_impact': overall,
            'infrastructure_types': ['Culvert Bridges', 'Highway Embankments', 'Hillside Habitations']
        }

    def evaluate_community_isolation(self, location, road_impact: dict) -> dict:
        loc_name = getattr(location, 'name', 'Upper Valley Sector') if location else 'Upper Valley Sector'
        impact = road_impact.get('impact_level', 'HIGH')

        if impact in ['CRITICAL', 'HIGH']:
            status = 'COMMUNITY ACCESS AT RISK'
            isolation_risk = 'HIGH'
            alt = 'Secondary Ridge Bypass via Local Panchayat Track'
        else:
            status = 'ACCESSIBLE'
            isolation_risk = 'LOW'
            alt = 'Primary arterial open and cleared'

        return {
            'community_settlement': f'{loc_name} Habitation Area',
            'nearest_road': road_impact.get('nearest_road', 'NH-6 Corridor'),
            'road_impact': impact,
            'accessibility_status': status,
            'isolation_risk': isolation_risk,
            'alternative_route': alt
        }

road_service = RoadNetworkService()