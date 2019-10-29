
# Toggle Button With Count

ToggleButtonCount maintains a counter in the state machine’s data that counts the number of times it turned on.

```ts
type ToggleButtonWithCountData = {
    count: number
}

export class ToggleButtonWithCount
    extends StateMachine<ToggleButtonWithCountData> {
    initialState = 'off'

    handlers: Handlers<ToggleButtonWithCountData> = [
        // if we get 'flip' in 'off', go to 'on'
        // and increment data.count
        ['cast#flip#off', ({data}) => nextState('on')
            .data({count: {$set: data.count + 1}})],

        // flip from on goes back to off.
        ['cast#flip#on', 'off']
    ]

    initialData: ToggleButtonWithCountData = {
        count: 0
    }

    flip() {
        this.cast('flip')
    }
}
```
```ts
let button = new ToggleButton()
button.startSM()

// initial state
console.log(await button.getState())    // 'off'

button.flip()
console.log(await button.getState())    // 'on'

button.flip()
console.log(await button.getState())    // 'off'
```
