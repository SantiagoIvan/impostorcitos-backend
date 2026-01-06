export enum Topic {
    ANIME = "Anime",
    MOVIES = "Peliculas",
    HOME_APPLIANCES = "Electrodomesticos",
    GAMES = "Juegos",
    MUSIC = "Musica",
    CLOTHES = "Ropa",
    SPORTS = "Deportes",
    SPORT_ELEMENTS = "ElementosDeportivos",
    ANIMALS = "Animales",
    DISEASES = "Enfermedades",
    FOOTBALL_PLAYERS = "JugadoresDeFutbol",
    COUNNTRIES = "Paises",
    TOOLS = "Herramientas",
    DEFAULT = "Anime"
}

export function parseTopic(value: string): Topic {
    const topics = Object.values(Topic);

    return topics.includes(value as Topic)
        ? (value as Topic)
        : Topic.DEFAULT;
}
