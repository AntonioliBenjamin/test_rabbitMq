import "reflect-metadata"
import express from 'express'
import {
    DomainEvent,
    EventHandler,
    EventHandlerRegistry,
    MessageIdentifiers,
    rabbitMqBuild,
    EventReceiver
} from "ddd-messaging-bus";
import {Container} from "inversify";

const app = express()
const port = 4000

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

class MyDomainEventHandler implements EventHandler {

    async handle(domainEvent: MyDomainEvent): Promise<void> {
        console.log(domainEvent);
        return
    }
}

async function init() {
    await rabbitMqBuild(container, urlAmqp);
    EventHandlerRegistry.register(MyDomainEvent, new MyDomainEventHandler());

    const eventReceiver = container.get<EventReceiver>(MessageIdentifiers.EventReceiver);

    await eventReceiver.init();

    console.log("Event successfully handled")

}

init()

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})