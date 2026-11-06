import type { Property } from "@/lib/types";
import gallery1 from "../../../data/property-photo-galleries/kwashieman-compound-house-dki.json";
import gallery2 from "../../../data/property-photo-galleries/kwashieman-lapaz-compound-house-dollardream.json";
import gallery3 from "../../../data/property-photo-galleries/kwashieman-villa-emmanuelappiah.json";
import gallery4 from "../../../data/property-photo-galleries/kwashieman-hong-kong-apartment-prudential.json";
import gallery5 from "../../../data/property-photo-galleries/labone-apartment-edmark.json";
import gallery6 from "../../../data/property-photo-galleries/labone-compound-house-brealty.json";
import gallery7 from "../../../data/property-photo-galleries/labone-apartment-angelanartey.json";
import gallery8 from "../../../data/property-photo-galleries/labone-apartment-unitedhomes.json";
import gallery10 from "../../../data/property-photo-galleries/labone-au-village-compound-house-tetteh.json";

/** Reviewed Adom Data listings; source property 9 is on hold at the owner's request. */
export const adomProperties: Property[] = [
  // Adom source property 1; source size has no stated measurement basis.
  {
    "id": "kwashieman-compound-house-dki",
    "address": "Kwashieman",
    "district": "Ablekuma North Municipal District",
    "region": "Greater Accra",
    "type": "Compound House",
    "style": "Detached",
    "storey": "Single Storey",
    "bedrooms": 15,
    "bathrooms": 14,
    "toilets": 10,
    "floorAreaSqm": 200,
    "askingPrice": 4500000,
    "status": "Available",
    "tenure": "Leasehold",
    "remainingLeaseTerm": "Not specified",
    "ecoRating": "D",
    "condition": "Fairly Used",
    "furnishing": "Unfurnished",
    "facilities": [
      "24-hour Electricity",
      "Air Conditioning",
      "Balcony",
      "Dining Area",
      "En Suite",
      "Kitchen Cabinets",
      "Kitchen Shelf",
      "Pop Ceiling",
      "Pre-Paid Meter",
      "Tiled Floor",
      "Wardrobe"
    ],
    "greenFeatures": [
      {
        "label": "Balcony",
        "icon": "leaf"
      }
    ],
    "agent": {
      "name": "DKI Properties",
      "phone": "+233594835799"
    },
    "images": gallery1.images,
    "summary": "15-bedroom compound house in Kwashieman."
  },
  // Adom source property 2; source size has no stated measurement basis.
  {
    "id": "kwashieman-lapaz-compound-house-dollardream",
    "address": "Kwashieman-Lapaz",
    "district": "Ablekuma North Municipal District",
    "region": "Greater Accra",
    "type": "Compound House",
    "style": "Detached",
    "storey": "Multi Storey",
    "bedrooms": 18,
    "bathrooms": 20,
    "toilets": 10,
    "floorAreaSqm": 450,
    "askingPrice": 10700000,
    "status": "Available",
    "tenure": "Leasehold",
    "remainingLeaseTerm": "Not specified",
    "ecoRating": "D",
    "condition": "Fairly Used",
    "furnishing": "Unfurnished",
    "facilities": [
      "Air Conditioning",
      "Balcony",
      "Dining Area",
      "En Suite",
      "Hot Water",
      "Kitchen Cabinets",
      "Pop Ceiling",
      "Pre-Paid Meter",
      "Tiled Floor",
      "Wardrobe"
    ],
    "greenFeatures": [
      {
        "label": "Green Shade",
        "icon": "leaf"
      }
    ],
    "agent": {
      "name": "Dollar dream Estate",
      "phone": "+233595369794"
    },
    "images": gallery2.images,
    "summary": "18-bedroom compound house in Kwashieman-Lapaz."
  },
  // Adom source property 3; source size has no stated measurement basis.
  {
    "id": "kwashieman-villa-emmanuelappiah",
    "address": "Kwashieman",
    "district": "Ablekuma North Municipal District",
    "region": "Greater Accra",
    "type": "Villa",
    "style": "Detached",
    "storey": "Multi Storey",
    "bedrooms": 8,
    "bathrooms": 6,
    "toilets": 7,
    "floorAreaSqm": 200,
    "askingPrice": 3800000,
    "status": "Available",
    "tenure": "Leasehold",
    "remainingLeaseTerm": "Not specified",
    "ecoRating": "D",
    "condition": "Newly Built",
    "furnishing": "Unfurnished",
    "facilities": [
      "Kitchen cabinets",
      "Pre-paid meters",
      "Dining area"
    ],
    "greenFeatures": [
      {
        "label": "Balcony",
        "icon": "leaf"
      },
      {
        "label": "Private garden",
        "icon": "leaf"
      },
      {
        "label": "Mature trees",
        "icon": "leaf"
      },
      {
        "label": "Landscaped compound",
        "icon": "leaf"
      }
    ],
    "agent": {
      "name": "Emmanuel Appiah",
      "phone": "+233552885458"
    },
    "images": gallery3.images,
    "summary": "8-bedroom villa in Kwashieman."
  },
  // Adom source property 4; source size has no stated measurement basis.
  {
    "id": "kwashieman-hong-kong-apartment-prudential",
    "address": "Kwashieman-Hong Kong",
    "district": "Ablekuma North Municipal District",
    "region": "Greater Accra",
    "type": "Apartment",
    "style": "Detached",
    "storey": "Single Storey",
    "bedrooms": 4,
    "bathrooms": 3,
    "toilets": 4,
    "floorAreaSqm": 5000,
    "askingPrice": 2300000,
    "status": "Available",
    "tenure": "Leasehold",
    "remainingLeaseTerm": "Not specified",
    "ecoRating": "D",
    "condition": "Fairly Used",
    "furnishing": "Unfurnished",
    "facilities": [
      "Kitchen cabinets",
      "Pre-paid meters",
      "Dining area",
      "PoP ceiling"
    ],
    "greenFeatures": [
      {
        "label": "Balcony",
        "icon": "leaf"
      },
      {
        "label": "Green grass",
        "icon": "leaf"
      }
    ],
    "agent": {
      "name": "Prudential Properties Agency",
      "phone": "+233244467680"
    },
    "images": gallery4.images,
    "summary": "4-bedroom apartment in Kwashieman-Hong Kong."
  },
  // Adom source property 5; source size has no stated measurement basis.
  {
    "id": "labone-apartment-edmark",
    "address": "Labone",
    "district": "Accra Metropolitan District",
    "region": "Greater Accra",
    "type": "Apartment",
    "style": "Detached",
    "storey": "Multi Storey",
    "bedrooms": 1,
    "bathrooms": 1,
    "toilets": 2,
    "floorAreaSqm": 300,
    "askingPrice": 1530000,
    "status": "Available",
    "tenure": "Leasehold",
    "remainingLeaseTerm": "Not specified",
    "ecoRating": "D",
    "condition": "Newly Built",
    "furnishing": "Unfurnished",
    "facilities": [
      "24-hour Electricity",
      "CCTV",
      "Fitted Kitchen",
      "swimming pool",
      "2 Air-conditions",
      "Wardrobe"
    ],
    "greenFeatures": [
      {
        "label": "Balcony",
        "icon": "leaf"
      }
    ],
    "agent": {
      "name": "Edmark Agency",
      "phone": "+233244119832"
    },
    "images": gallery5.images,
    "summary": "1-bedroom apartment in Labone."
  },
  // Adom source property 6; source size has no stated measurement basis.
  {
    "id": "labone-compound-house-brealty",
    "address": "Labone",
    "district": "Accra Metropolitan District",
    "region": "Greater Accra",
    "type": "Compound House",
    "style": "Detached",
    "storey": "Multi Storey",
    "bedrooms": 4,
    "bathrooms": 5,
    "toilets": 5,
    "floorAreaSqm": 100,
    "askingPrice": 10290000,
    "status": "Available",
    "tenure": "Leasehold",
    "remainingLeaseTerm": "Not specified",
    "ecoRating": "D",
    "condition": "Fairly Used",
    "furnishing": "Unfurnished",
    "facilities": [
      "24-hour Electricity",
      "Plant",
      "Fitted Kitchen",
      "Air-conditions",
      "Wardrobe"
    ],
    "greenFeatures": [
      {
        "label": "Balcony",
        "icon": "leaf"
      }
    ],
    "agent": {
      "name": "B. Realty Ghana",
      "phone": "+233277451439",
      "secondaryPhone": "+233545105124"
    },
    "images": gallery6.images,
    "summary": "4-bedroom compound house in Labone."
  },
  // Adom source property 7; source size has no stated measurement basis.
  {
    "id": "labone-apartment-angelanartey",
    "address": "Labone",
    "district": "Accra Metropolitan District",
    "region": "Greater Accra",
    "type": "Apartment",
    "style": "Detached",
    "storey": "Multi Storey",
    "bedrooms": 3,
    "bathrooms": 3,
    "toilets": 4,
    "floorAreaSqm": 350,
    "askingPrice": 2600000,
    "status": "Available",
    "tenure": "Leasehold",
    "remainingLeaseTerm": "Not specified",
    "ecoRating": "D",
    "condition": "Fairly Used",
    "furnishing": "Furnished",
    "facilities": [
      "Gym",
      "air conditioners",
      "furniture and beds",
      "a fitted well equipped kitchen with appliances",
      "televisions sets",
      "a spacious living room",
      "dining area",
      "all rooms en-suite with washrooms",
      "balcony"
    ],
    "greenFeatures": [
      {
        "label": "Balcony",
        "icon": "leaf"
      }
    ],
    "agent": {
      "name": "Angela Nartey",
      "phone": "+233203262141"
    },
    "images": gallery7.images,
    "summary": "3-bedroom apartment in Labone."
  },
  // Adom source property 8; source size has no stated measurement basis.
  {
    "id": "labone-apartment-unitedhomes",
    "address": "Labone",
    "district": "Accra Metropolitan District",
    "region": "Greater Accra",
    "type": "Apartment",
    "style": "Detached",
    "storey": "Multi Storey",
    "bedrooms": 2,
    "bathrooms": 3,
    "toilets": 3,
    "floorAreaSqm": 1000,
    "askingPrice": 2250000,
    "status": "Available",
    "tenure": "Leasehold",
    "remainingLeaseTerm": "Not specified",
    "ecoRating": "D",
    "condition": "Newly Built",
    "furnishing": "Unfurnished",
    "facilities": [
      "Air Conditioning",
      "Dining Area",
      "24-hour Electricity",
      "Kitchen Shelf",
      "Microwave",
      "Hot Water",
      "En Suite",
      "Kitchen Cabinets",
      "Chandelier",
      "Dishwasher",
      "Balcony",
      "Swimming pool",
      "A gym"
    ],
    "greenFeatures": [
      {
        "label": "Balcony",
        "icon": "leaf"
      }
    ],
    "agent": {
      "name": "United Homes",
      "phone": "+233545640939"
    },
    "images": gallery8.images,
    "summary": "2-bedroom apartment in Labone."
  },
  // Adom source property 10; source size has no stated measurement basis.
  {
    "id": "labone-au-village-compound-house-tetteh",
    "address": "Labone-AU Village",
    "district": "Accra Metropolitan District",
    "region": "Greater Accra",
    "type": "Compound House",
    "style": "Detached",
    "storey": "Multi Storey",
    "bedrooms": 4,
    "bathrooms": 4,
    "toilets": 5,
    "floorAreaSqm": 2332,
    "askingPrice": 15940000,
    "status": "Available",
    "tenure": "Leasehold",
    "remainingLeaseTerm": "Not specified",
    "ecoRating": "D",
    "condition": "Fairly Used",
    "furnishing": "Unfurnished",
    "facilities": [
      "Air Conditioning",
      "Dining Area",
      "24-hour Electricity",
      "Wardrobe",
      "PoP ceiling",
      "Refrigerator",
      "TV",
      "En Suite",
      "Kitchen Cabinets",
      "Tiled floor",
      "Balcony"
    ],
    "greenFeatures": [
      {
        "label": "Balcony",
        "icon": "leaf"
      },
      {
        "label": "Green space",
        "icon": "leaf"
      }
    ],
    "agent": {
      "name": "Tetteh",
      "phone": "+233550040400"
    },
    "images": gallery10.images,
    "summary": "4-bedroom compound house in Labone-AU Village."
  }
];
