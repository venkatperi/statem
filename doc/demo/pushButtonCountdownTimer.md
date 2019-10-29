# Push Button Countdown Timer

PushButtonCountdownTimer turns on when pushed and starts a `genericTimeout`. The button turns off when the timer fires.

```ts
type PushButtonCountdownTimerData = {
    timeout: Timeout
}

class PushButtonCountdownTimer extends StateMachine<PushButtonCountdownTimerData> {
    initialState = 'off'

    handlers: Handlers<PushButtonCountdownTimerData> = [
        // Start a generic timer and go to 'on'
        ['cast#push#off', ({data}) => nextState('on').timeout(data.timeout)],

        // when we get 'genericTimeout' in 'on',
        // go back to 'off'
        ['genericTimeout#*_#on', 'off']
    ]

    constructor(timeout: Timeout) {
        super()
        this.initialData = {timeout}
    }

    push() {
        this.cast('push')
    }
}
```