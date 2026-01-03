let seq_game = 0

export function nextSeqGame(): string{
    seq_game += 1
    return seq_game.toString()
}

let seq_message = 0


export function nextSeqMessage(): string{
    seq_message += 1
    return seq_message.toString()
}

let seq_room = 0

export function nextSeqRoom(): string{
    seq_room += 1
    return seq_room.toString()
}

let seq_user = 0

export function nextSeqUser(): string{
    seq_user += 1
    return seq_user.toString()
}