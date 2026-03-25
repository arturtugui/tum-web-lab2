# PagesCMS Services Configuration Issue

## Problem Summary

The Services section in PagesCMS is displaying the form fields (Titlu Serviciu, Slug, Icon, Descriere) but they are all **empty** and not populated with the data from `services.json`. The website itself renders correctly, so the data exists in the JSON file, but the CMS UI cannot read or display it.

## Current Configuration

### `.pages.yml` (Services section)

```yaml
  # Services
  - name: services
    label: Servicii
    path: astro-project/src/data/services.json
    type: file
    fields:
      - name: heading
        label: Titlu Secțiune
        type: string
      - name: items
        label: Lista Servicii
        type: object
        fields:
          - { name: title, label: "Titlu Serviciu", type: string }
          - { name: slug, label: "Slug (ID)", type: string }
          - { name: icon, label: "Icon (fa-class)", type: string }
          - { name: description, label: "Descriere", type: text }
```

### `services.json` (Current Data Structure)

```json
{
  "heading": "Servicii oferite",
  "items": [
    {
      "title": "Mobilier pentru Living și Dormitor",
      "slug": "living",
      "icon": "fa-couch",
      "description": "Canapele, paturi, dulapuri și piese moderne realizate din materiale durabile."
    },
    {
      "title": "Bucătării la Comandă",
      "slug": "kitchens",
      "icon": "fa-utensils",
      "description": "Proiectăm și realizăm bucătării personalizate, adaptate spațiului și stilului tău de viață."
    },
    {
      "title": "Uși pentru Interioare",
      "slug": "doors",
      "icon": "fa-door-closed",
      "description": "Uși interioare de design, realizate din materiale de calitate, care combină funcționalitatea cu eleganța."
    },
    {
      "title": "Ferestre și Uși PVC",
      "slug": "windows",
      "icon": "fa-gopuram",
      "description": "Ferestre și uși PVC de calitate, cu izolație optimă și design modern, pentru confort și eficiență termică."
    }
  ]
}
```

## Issue Details

1. **CMS displays the form fields but they are empty**
   - The "Titlu Serviciu" field appears empty even though it has data in JSON
   - Slug field appears empty
   - Icon field appears empty
   - Descriere field appears empty

2. **The data mismatch**
   - The `.pages.yml` defines `items` as `type: object` (singular object)
   - The actual JSON has `items` as an array of objects (multiple services)
   - PagesCMS appears to be trying to read `items` as a single object but the structure doesn't match

3. **What we tried**
   - Added a `view` section to specify which fields to display in the list
   - This resulted in the error: `'type' must be a valid field type` because `view` is not valid on `type: object`
   - Reverted this change

## Current Behavior

- ✅ The website displays services correctly (component works)
- ✅ The JSON file contains all 4 services with correct data
- ❌ The CMS UI shows empty form fields for the "Lista Servicii" section
- ❌ Cannot easily add new services through CMS UI
- ❌ Cannot edit existing service data through CMS UI

## Questions for Resolution

1. Should the JSON structure be flattened (service-1, service-2, etc. as separate objects) instead of using an array?
2. Should we switch to a collection-based approach (separate JSON files for each service) to allow full CMS add/edit/delete functionality?
3. Is there a way to make PagesCMS recognize and properly edit the items array structure?

## Next Steps Needed

Need guidance on the best architecture that:
- ✅ Allows users to add/edit/delete services via CMS UI only
- ✅ Properly displays current data in CMS form fields
- ✅ Maintains clean component code in Astro
