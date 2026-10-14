import type { WeaknessCategory } from "./types";

export const weaknessCategories: WeaknessCategory[] = [
  {
    id: "mechanics",
    name: "Mechanics",
    icon: "⚡",
    description: "Raw mechanical skill — building, editing, and movement",
    skills: [
      {
        id: "building-speed",
        name: "Building Speed",
        description: "How fast you can place builds under pressure",
      },
      {
        id: "editing-speed",
        name: "Edit Speed & Accuracy",
        description: "Clean, fast edits in fights and retakes",
      },
      {
        id: "piece-control",
        name: "Piece Control",
        description: "Taking ownership of walls, floors, and cones around opponents",
      },
      {
        id: "movement",
        name: "Movement & Peeking",
        description: "Strafing, jump peeking, right-hand advantage usage",
      },
      {
        id: "retakes",
        name: "Retakes & Height Control",
        description: "Efficient height retakes without wasting mats",
      },
    ],
  },
  {
    id: "aim",
    name: "Aim",
    icon: "🎯",
    description: "Tracking, flicking, and accuracy across all ranges",
    skills: [
      {
        id: "ar-tracking",
        name: "AR Tracking",
        description: "Sustained beam accuracy at mid-range",
      },
      {
        id: "shotgun-aim",
        name: "Shotgun Aim",
        description: "Consistent high-damage shotgun hits in box fights",
      },
      {
        id: "smg-tracking",
        name: "SMG Tracking",
        description: "Close-range tracking with spray weapons",
      },
      {
        id: "sniper-aim",
        name: "Sniper Accuracy",
        description: "Leading shots and hitting flicks at distance",
      },
      {
        id: "crosshair-placement",
        name: "Crosshair Placement",
        description: "Pre-aiming common angles and keeping crosshair at head level",
      },
    ],
  },
  {
    id: "fighting",
    name: "Fighting",
    icon: "⚔️",
    description: "In-fight decision-making, aggression, and composure",
    skills: [
      {
        id: "box-fighting",
        name: "Box Fighting",
        description: "1v1 close-quarters fighting inside builds",
      },
      {
        id: "w-keying",
        name: "W-Keying & Aggression",
        description: "Pushing and finishing fights efficiently",
      },
      {
        id: "disengaging",
        name: "Disengaging",
        description: "Knowing when and how to safely exit a fight",
      },
      {
        id: "clutching",
        name: "Clutch Situations",
        description: "Performing under pressure in 1vX scenarios",
      },
      {
        id: "trade-awareness",
        name: "Trade Awareness",
        description: "Avoiding getting third-partied mid-fight",
      },
    ],
  },
  {
    id: "game-sense",
    name: "Game Sense",
    icon: "🧠",
    description: "Rotations, positioning, zone reads, and macro play",
    skills: [
      {
        id: "zone-rotations",
        name: "Zone Rotations",
        description: "Timing and path selection for rotating to zone",
      },
      {
        id: "positioning",
        name: "Positioning",
        description: "Choosing optimal positions relative to zone and opponents",
      },
      {
        id: "storm-surge",
        name: "Storm Surge Management",
        description: "Getting tags to stay above surge threshold in stacked games",
      },
      {
        id: "loot-pathing",
        name: "Loot Pathing",
        description: "Efficient looting routes and inventory management",
      },
      {
        id: "awareness",
        name: "Map Awareness",
        description: "Tracking enemy positions and reading the kill feed",
      },
    ],
  },
  {
    id: "endgame",
    name: "Endgame",
    icon: "🏆",
    description: "Late-game performance in moving zones and finals",
    skills: [
      {
        id: "tarping",
        name: "Tarping",
        description: "Building and maintaining tarps through moving zones",
      },
      {
        id: "tunneling",
        name: "Tunneling",
        description: "Efficient low-ground tunneling techniques",
      },
      {
        id: "zone-reads",
        name: "Zone Reads",
        description: "Predicting zone pulls and positioning accordingly",
      },
      {
        id: "mat-conservation",
        name: "Mat Conservation",
        description: "Managing materials efficiently in late game",
      },
      {
        id: "final-zone",
        name: "Final Zone Plays",
        description: "Making the right play in the last few zones",
      },
    ],
  },
  {
    id: "offspawn",
    name: "Off Spawn",
    icon: "🔥",
    description: "Early-game landing, looting, and first fights",
    skills: [
      {
        id: "landing-route",
        name: "Landing Route",
        description: "Optimized bus routes and landing spots",
      },
      {
        id: "chest-routing",
        name: "Chest Routing",
        description: "Efficient chest and loot pathing at your POI",
      },
      {
        id: "contested-fights",
        name: "Contested Fights",
        description: "Winning fights when your POI is contested",
      },
      {
        id: "early-rotations",
        name: "Early Rotations",
        description: "Rotating out of POI safely with good loot",
      },
      {
        id: "loadout-priority",
        name: "Loadout Priority",
        description: "Knowing which weapons and items to prioritize",
      },
    ],
  },
];
