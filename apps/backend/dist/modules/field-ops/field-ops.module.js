"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupFieldOpsModule = void 0;
const field_ops_routes_1 = require("./routes/field-ops.routes");
/**
 * Point d'entrée principal pour le montage du module Field-Ops dans l'application Express.
 */
const setupFieldOpsModule = (db) => {
    return (0, field_ops_routes_1.fieldOpsRouter)(db);
};
exports.setupFieldOpsModule = setupFieldOpsModule;
//# sourceMappingURL=field-ops.module.js.map