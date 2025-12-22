let seq_game = 0

export function nextSeqGame(){
    seq_game += 1
    return seq_game.toString()
}

let seq_message = 0


export function nextSeqMessage(){
    seq_message += 1
    return seq_message.toString()
}

let seq_room = 2

export function nextSeqRoom(){
    seq_room += 1
    return seq_room.toString()
}