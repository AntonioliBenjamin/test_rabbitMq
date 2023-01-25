import "reflect-metadata"
import express from 'express'
import {DomainEvent} from "ddd-messaging-bus"
import { EventHandler } from "ddd-messaging-bus"
import {EventHandlerRegistry, EventReceiver, rabbitMqBuild, MessageIdentifiers} from "ddd-messaging-bus";
import { Container } from "inversify";
import { injectable } from "inversify";
import {inject} from "inversify";
import {EventDispatcher} from "ddd-messaging-bus"

const app = express()
const port = 3000

const urlAmqp ='amqps://xdoesltn:K8V5ZjrCUlIhKwFi6UsyJcEcGZyi8HvT@rattlesnake.rmq.cloudamqp.com/xdoesltn'

//domain event ----------
export type YourDomainEventProperties = {
    userName: string;
    email: string;
}

export class MyDomainEvent extends DomainEvent<YourDomainEventProperties > {
    constructor(props: YourDomainEventProperties ) {
        super(props)
    }
}
//----------------------



//event handler---------
@injectable()
export class MyEventHandler implements EventHandler {

    async handle(domainEvent: MyDomainEvent): Promise<void> {
        console.log(`this is my domain event : ${domainEvent}`)
    }
}
//---------------------



//Use case ------------
type UseCaseInput = {
  userName: string;
  email: string
}

@injectable()
export class UseCase {
    constructor(@inject(MessageIdentifiers.EventDispatcher) private readonly eventDispatcher: EventDispatcher) 
    {}
    
    async execute(input: UseCaseInput) {
      const myDomainEvent = new MyDomainEvent({
        email: input.email,
        userName: input.userName
      })

       await this.eventDispatcher.dispatch(myDomainEvent) 
  }
}
//---------------------


//identifier-----------
const identifier = { UseCase : Symbol.for('UseCase')};
//---------------------



//container------------
class MyContainer extends Container {
	async init() {
	
		rabbitMqBuild(this, urlAmqp)

    this.bind(identifier.UseCase).toSelf()

  	EventHandlerRegistry.register(MyDomainEvent, new MyEventHandler());

		const eventReceiver: EventReceiver = this.get(MessageIdentifiers.EventReceiver);

		await eventReceiver.init()
	}
}
//---------------------



//Setup----------------
const container = new MyContainer()
container.init()
//---------------------



const eventDispatcher: EventDispatcher = container.get(MessageIdentifiers.EventDispatcher)

const useCase = new UseCase(eventDispatcher)

useCase.execute({
  email: 'toto',
  userName: 'toto'
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})