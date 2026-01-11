"""
Team code mapping for Live Matches API
Maps team codes (like 'R', 'O', etc.) to full team names and flag images
"""
import os

# Team code to team name and flag mapping
TEAM_MAPPING = {
    # New Zealand
    "R": {
        "name": "New Zealand",
        "shortName": "NZ",
        "flag": "https://flagcdn.com/w40/nz.png",
        "code": "NZ"
    },
    # India
    "O": {
        "name": "India",
        "shortName": "IND",
        "flag": "https://flagcdn.com/w40/in.png",
        "code": "IND"
    },
    # Australia
    "A": {
        "name": "Australia",
        "shortName": "AUS",
        "flag": "https://flagcdn.com/w40/au.png",
        "code": "AUS"
    },
    # England
    "E": {
        "name": "England",
        "shortName": "ENG",
        "flag": "https://flagcdn.com/w40/gb.png",
        "code": "ENG"
    },
    # Pakistan
    "P": {
        "name": "Pakistan",
        "shortName": "PAK",
        "flag": "https://flagcdn.com/w40/pk.png",
        "code": "PAK"
    },
    # South Africa
    "S": {
        "name": "South Africa",
        "shortName": "RSA",
        "flag": "https://flagcdn.com/w40/za.png",
        "code": "RSA"
    },
    # West Indies
    "W": {
        "name": "West Indies",
        "shortName": "WI",
        "flag": "https://flagcdn.com/w40/ag.png",  # Using Antigua as placeholder
        "code": "WI"
    },
    # Sri Lanka
    "L": {
        "name": "Sri Lanka",
        "shortName": "SL",
        "flag": "https://flagcdn.com/w40/lk.png",
        "code": "SL"
    },
    # Bangladesh
    "B": {
        "name": "Bangladesh",
        "shortName": "BAN",
        "flag": "https://flagcdn.com/w40/bd.png",
        "code": "BAN"
    },
    # Afghanistan
    "F": {
        "name": "Afghanistan",
        "shortName": "AFG",
        "flag": "https://flagcdn.com/w40/af.png",
        "code": "AFG"
    },
    # Other common codes (you may need to expand this based on API responses)
    "MZ": {"name": "Pretoria Capitals", "shortName": "PC", "flag": "https://flagcdn.com/w40/za.png", "code": "PC"},
    "MY": {"name": "Pretoria Capitals", "shortName": "PC", "flag": "https://flagcdn.com/w40/za.png", "code": "PC"},
    "MW": {"name": "MI Cape Town", "shortName": "MICT", "flag": "https://flagcdn.com/w40/za.png", "code": "MICT"},
    "MX": {"name": "MI Cape Town", "shortName": "MICT", "flag": "https://flagcdn.com/w40/za.png", "code": "MICT"},
    "N0": {"name": "Team 1", "shortName": "T1", "flag": "https://flagcdn.com/w40/xx.png", "code": "T1"},
    "N1": {"name": "Team 2", "shortName": "T2", "flag": "https://flagcdn.com/w40/xx.png", "code": "T2"},
    "NW": {"name": "Western Australia Women", "shortName": "WA-W", "flag": "https://flagcdn.com/w40/au.png", "code": "WA-W"},
    "NV": {"name": "Western Australia Women", "shortName": "WA-W", "flag": "https://flagcdn.com/w40/au.png", "code": "WA-W"},
    "57": {"name": "Northern Brave", "shortName": "NB", "flag": "https://flagcdn.com/w40/nz.png", "code": "NB"},
    "54": {"name": "Northern Brave", "shortName": "NB", "flag": "https://flagcdn.com/w40/nz.png", "code": "NB"},
    "JU": {"name": "Wellington Women", "shortName": "WELL-W", "flag": "https://flagcdn.com/w40/nz.png", "code": "WELL-W"},
    "JS": {"name": "Wellington Women", "shortName": "WELL-W", "flag": "https://flagcdn.com/w40/nz.png", "code": "WELL-W"},
    "JT": {"name": "Team 1", "shortName": "T1", "flag": "https://flagcdn.com/w40/xx.png", "code": "T1"},
    "JV": {"name": "Team 2", "shortName": "T2", "flag": "https://flagcdn.com/w40/xx.png", "code": "T2"},
    "52": {"name": "Team 1", "shortName": "T1", "flag": "https://flagcdn.com/w40/xx.png", "code": "T1"},
    "53": {"name": "Team 2", "shortName": "T2", "flag": "https://flagcdn.com/w40/xx.png", "code": "T2"},
    "H9": {"name": "Team 1", "shortName": "T1", "flag": "https://flagcdn.com/w40/xx.png", "code": "T1"},
    "GP": {"name": "Team 2", "shortName": "T2", "flag": "https://flagcdn.com/w40/xx.png", "code": "T2"},
    "HD": {"name": "Team 1", "shortName": "T1", "flag": "https://flagcdn.com/w40/xx.png", "code": "T1"},
    "GT": {"name": "Team 2", "shortName": "T2", "flag": "https://flagcdn.com/w40/xx.png", "code": "T2"},
    "T": {"name": "Team 1", "shortName": "T1", "flag": "https://flagcdn.com/w40/xx.png", "code": "T1"},
    "U": {"name": "Team 2", "shortName": "T2", "flag": "https://flagcdn.com/w40/xx.png", "code": "T2"},
    "QJ": {"name": "Gujarat Giants Women", "shortName": "GGW", "flag": "https://flagcdn.com/w40/in.png", "code": "GGW"},
    "QM": {"name": "Gujarat Giants Women", "shortName": "GGW", "flag": "https://flagcdn.com/w40/in.png", "code": "GGW"},
    "QI": {"name": "Gujarat Giants Women", "shortName": "GGW", "flag": "https://flagcdn.com/w40/in.png", "code": "GGW"},
    "5T": {"name": "Rajshahi Warriors", "shortName": "RJW", "flag": "https://flagcdn.com/w40/bd.png", "code": "RJW"},
    "AH": {"name": "Rajshahi Warriors", "shortName": "RJW", "flag": "https://flagcdn.com/w40/bd.png", "code": "RJW"},
    "1E1": {"name": "Noakhali Express", "shortName": "NEX", "flag": "https://flagcdn.com/w40/bd.png", "code": "NEX"},
    "UC": {"name": "Noakhali Express", "shortName": "NEX", "flag": "https://flagcdn.com/w40/bd.png", "code": "NEX"},
    "8O": {"name": "Sri Lanka U19", "shortName": "SL-U19", "flag": "https://flagcdn.com/w40/lk.png", "code": "SL-U19"},
    "8H": {"name": "Sri Lanka U19", "shortName": "SL-U19", "flag": "https://flagcdn.com/w40/lk.png", "code": "SL-U19"},
    "K7": {"name": "Majees Titans", "shortName": "MT", "flag": "https://flagcdn.com/w40/xx.png", "code": "MT"},
    "K3": {"name": "Majees Titans", "shortName": "MT", "flag": "https://flagcdn.com/w40/xx.png", "code": "MT"},
    "1E6": {"name": "Team 1", "shortName": "T1", "flag": "https://flagcdn.com/w40/xx.png", "code": "T1"},
    "K2": {"name": "Team 2", "shortName": "T2", "flag": "https://flagcdn.com/w40/xx.png", "code": "T2"},
    "K5": {"name": "Team 1", "shortName": "T1", "flag": "https://flagcdn.com/w40/xx.png", "code": "T1"},
    # WPL Teams
    "4O": {"name": "Delhi Capitals Women", "shortName": "DCW", "flag": "https://flagcdn.com/w40/in.png", "code": "DCW"},
    "40": {"name": "Delhi Capitals Women", "shortName": "DCW", "flag": "https://flagcdn.com/w40/in.png", "code": "DCW"},
    "4N": {"name": "Gujarat Giants Women", "shortName": "GGW", "flag": "https://flagcdn.com/w40/in.png", "code": "GGW"},
    "4Q": {"name": "Gujarat Giants Women", "shortName": "GGW", "flag": "https://flagcdn.com/w40/in.png", "code": "GGW"},
}

def get_team_info(team_code: str) -> dict:
    """Get team information from team code"""
    return TEAM_MAPPING.get(team_code, {
        "name": team_code,
        "shortName": team_code,
        "flag": "https://flagcdn.com/w40/xx.png",  # Unknown flag placeholder
        "code": team_code
    })

def map_team_code(team_code: str) -> str:
    """Map team code to full team name"""
    team_info = get_team_info(team_code)
    return team_info["name"]

def get_team_flag(team_code: str) -> str:
    """Get team flag URL from team code"""
    team_info = get_team_info(team_code)
    return team_info["flag"]

def get_team_short_name(team_code: str) -> str:
    """Get team short name from team code"""
    team_info = get_team_info(team_code)
    return team_info["shortName"]

