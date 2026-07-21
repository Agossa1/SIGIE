"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Ce fichier est conservé pour exporter les nouveaux contrôleurs ou pour la compatibilité.
// Il est recommandé de référencer directement les contrôleurs individuels dans les routes.
__exportStar(require("./create-team.controller"), exports);
__exportStar(require("./get-all-teams.controller"), exports);
__exportStar(require("./transfer-member.controller"), exports);
__exportStar(require("./self-check-in.controller"), exports);
__exportStar(require("./update-team.controller"), exports);
__exportStar(require("./delete-team.controller"), exports);
__exportStar(require("./get-team-locations.controller"), exports);
__exportStar(require("./manage-team-members.controller"), exports);
//# sourceMappingURL=team.controller.js.map