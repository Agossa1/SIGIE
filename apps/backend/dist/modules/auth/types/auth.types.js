"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountType = exports.UserStatus = exports.Role = void 0;
var Role;
(function (Role) {
    Role["SUPER_ADMIN"] = "super_admin";
    Role["PLATFORM_ADMIN"] = "platform_admin";
    Role["MINISTRY"] = "ministry";
    Role["PREFECTURE_DIRECTOR"] = "prefecture_director";
    Role["MAYOR"] = "mayor";
    Role["DST_MANAGER"] = "dst_manager";
    Role["SGDS_MANAGER"] = "sgds_manager";
    Role["SUPERVISOR"] = "supervisor";
    Role["TEAM_LEADER"] = "team_leader";
    Role["TECHNICIAN"] = "technician";
    Role["VIEWER"] = "viewer";
})(Role || (exports.Role = Role = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["PENDING"] = "pending";
    UserStatus["ACTIVE"] = "active";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["DISABLED"] = "disabled";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var AccountType;
(function (AccountType) {
    AccountType["USER"] = "user";
    AccountType["ADMIN"] = "admin";
    AccountType["ORGANIZATION"] = "organization";
    AccountType["MUNICIPALITY"] = "municipality";
    AccountType["DISTRICT"] = "district";
    AccountType["NEIGHBORHOOD"] = "neighborhood";
    AccountType["FIELD_AGENT"] = "field_agent";
    AccountType["TECHNICIAN"] = "technician";
    AccountType["PARTNER"] = "partner";
    AccountType["SUPPLIER"] = "supplier";
    AccountType["CITIZEN"] = "citizen";
})(AccountType || (exports.AccountType = AccountType = {}));
//# sourceMappingURL=auth.types.js.map