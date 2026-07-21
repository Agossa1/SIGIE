/** Libellés de périmètre territorial affichés dans les tableaux de bord par espace rôle. */
export const ROLE_SCOPE_LABELS: Record<string, { scopeLabel: string; perimeterTag: string; spaceSubtitle: string }> = {
  ministry: {
    scopeLabel: "République du Bénin — Niveau national",
    perimeterTag: "Périmètre national",
    spaceSubtitle: "Espace ministériel",
  },
  prefecture: {
    scopeLabel: "Département de l'Atlantique",
    perimeterTag: "Périmètre préfectoral",
    spaceSubtitle: "Espace préfectoral",
  },
  mayor: {
    scopeLabel: "Commune de Cotonou",
    perimeterTag: "Périmètre communal",
    spaceSubtitle: "Espace communal",
  },
  dst: {
    scopeLabel: "Services techniques municipaux (DST)",
    perimeterTag: "Périmètre DST",
    spaceSubtitle: "Espace DST",
  },
  sgds: {
    scopeLabel: "Direction SGDS — assainissement",
    perimeterTag: "Périmètre SGDS",
    spaceSubtitle: "Espace SGDS",
  },
  supervisor: {
    scopeLabel: "Zone de supervision terrain",
    perimeterTag: "Zone supervisée",
    spaceSubtitle: "Supervision de zone",
  },
  teamLeader: {
    scopeLabel: "Brigade terrain — coordination",
    perimeterTag: "Brigade active",
    spaceSubtitle: "Chef de brigade",
  },
  techniciens: {
    scopeLabel: "Missions terrain assignées",
    perimeterTag: "Agent terrain",
    spaceSubtitle: "Équipe terrain",
  },
}

export function getScopeForFolder(folder: string) {
  return (
    ROLE_SCOPE_LABELS[folder] ?? {
      scopeLabel: "Périmètre opérationnel",
      perimeterTag: "Territoire",
      spaceSubtitle: "HSE TERRA",
    }
  )
}
