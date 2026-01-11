# Team Flags

This directory contains static flag images for teams.

## Using CDN (Recommended)

The app currently uses flags from `https://flagcdn.com/` CDN, which is more reliable and doesn't require downloading files.

## Downloading Flags Locally (Optional)

If you want to use local flag files instead of CDN, you can download flags from:
- https://flagcdn.com/
- Or use any flag icon service

### Common Flags Needed:
- `nz.png` - New Zealand
- `in.png` - India
- `au.png` - Australia
- `gb.png` - England
- `pk.png` - Pakistan
- `za.png` - South Africa
- `lk.png` - Sri Lanka
- `bd.png` - Bangladesh
- `af.png` - Afghanistan
- etc.

### Usage:
Update the team mapping in `backend/team_mapping.py` to use local paths:
```python
"flag": "/flags/nz.png"  # instead of CDN URL
```

