/**
 * Services barrel export
 * 
 * Each service maps to a future NestJS controller:
 * - publicacionesService  → PublicacionesController
 * - imagenesService       → ImagenesController
 * - preguntasService      → PreguntasController
 * - favoritosService      → FavoritosController
 * - profileService        → ProfileController
 * - authService           → AuthController
 * - aiService             → AIController
 * - storageService        → StorageController
 */

export { publicacionesService } from "./publicaciones.service";
export type { Publicacion, CreatePublicacionDTO, UpdatePublicacionDTO, AIAssessmentDTO } from "./publicaciones.service";

export { imagenesService } from "./imagenes.service";
export type { ImagenPublicacion } from "./imagenes.service";

export { preguntasService } from "./preguntas.service";
export type { Pregunta } from "./preguntas.service";

export { favoritosService } from "./favoritos.service";

export { profileService } from "./profile.service";
export type { ProfileDTO } from "./profile.service";

export { authService } from "./auth.service";

export { aiService } from "./ai.service";
export type { AssessVehicleDTO, AssessmentResult } from "./ai.service";

export { storageService } from "./storage.service";
