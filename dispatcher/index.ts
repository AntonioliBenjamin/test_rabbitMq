import "reflect-metadata"
import express from 'express'
import {DomainEvent} from "ddd-messaging-bus"
import {rabbitMqBuild, MessageIdentifiers} from "ddd-messaging-bus";
import {Container} from "inversify";
import {EventDispatcher} from "ddd-messaging-bus"

const app = express()
const port = 3000
const container = new Container()
const urlAmqp = 'amqps://xdoesltn:K8V5ZjrCUlIhKwFi6UsyJcEcGZyi8HvT@rattlesnake.rmq.cloudamqp.com/xdoesltn'

export type YourDomainEventProperties = {
    userName: string;
    email: string;
}

export class MyDomainEvent extends DomainEvent<YourDomainEventProperties> {
    constructor(props: YourDomainEventProperties) {
        super(props)
    }
}

async function init() {
    await rabbitMqBuild(container, urlAmqp)
}

async function dispatch() {
    const myDomainEvent = new MyDomainEvent({
        email: 'toto@gmail.com',
        userName: 'toto'
    })
    const eventDispatcher = container.get<EventDispatcher>(MessageIdentifiers.EventDispatcher);
    await eventDispatcher.dispatch(myDomainEvent)
    console.log("dispatched")
}

init().then(r => dispatch())


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})