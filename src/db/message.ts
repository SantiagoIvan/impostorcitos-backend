import { Message } from "../shared"

let seq_message = 0


export function nextSeqMessage(){
    seq_message += 1
    return seq_message.toString()
}

export let defaultMessages : Message[]= []

export function setMessages(messages: Message[]) {
    defaultMessages = messages
}


