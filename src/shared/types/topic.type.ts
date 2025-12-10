export enum Topic {
    ANIME = "Anime",
    MOVIES = "Peliculas",
    HOME_APPLIANCES = "Electrodomesticos",
    GAMES = "Juegos",
    MUSIC = "Musica",
    ANIME_CHARACTERS = "PersonajesDeAnime",
    CLOTHES = "Ropa",
    SPORTS = "Deportes",
    DEFAULT = "Anime"
}

export function parseTopic(value: string): Topic {
    const topics = Object.values(Topic);

    return topics.includes(value as Topic)
        ? (value as Topic)
        : Topic.DEFAULT;
}
