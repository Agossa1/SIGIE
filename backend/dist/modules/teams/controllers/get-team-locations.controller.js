"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTeamLocationsController = void 0;
class GetTeamLocationsController {
    constructor(teamRepository) {
        this.teamRepository = teamRepository;
        this.handle = async (req, res, next) => {
            try {
                const locations = await this.teamRepository.getLatestTeamLocations();
                return res.json({
                    success: true,
                    data: locations
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetTeamLocationsController = GetTeamLocationsController;
//# sourceMappingURL=get-team-locations.controller.js.map