import { BadRequestError, NotFoundError, ForbiddenError } from "../../../../apps/backend/src/shared/errors/appErrors";
import { GisRepository } from "../repositories/gis.repositories";
import { UpdateGisLayerDTO } from "../types/gis.types";

export class UpdateGisLayerService {
    constructor(private readonly repository: GisRepository){}

    async execute(layerId:string, dto:UpdateGisLayerDTO, userRoles:string[]){
        try {
            
        // Verification de la permissions de l'utilisateur
        if(!userRoles.includes('super_admin') && !userRoles.includes('platform_admin') && !userRoles.includes('supervisor')){
            throw new ForbiddenError("Vous n'avez pas la permission de modifier cette carte");
        }

        // Verification de l'existance de la carte 
        const gisExisting = await this.repository.getLayers();
        if(!gisExisting.find((gis) => gis.id === layerId)){
            throw new NotFoundError("La carte n'a pas été trouvée");
        }

        // mise a jour de la carte

        const updateGis = await this.repository.updateGisLayer(layerId, dto, userRoles);

        return updateGis;
        } catch (error) {
            throw new BadRequestError(`Erreur lors de la mise à jour de la carte : ${error}`);
        }
    }
}