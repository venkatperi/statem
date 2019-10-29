# A Hotel Safe

See [![](https://img.shields.io/badge/demo-online-green.svg)](https://hotel-safe.netlify.com/#/) 

`HotelSafe` simulates a type of safe frequently seen in hotel rooms.

*   **Locking the Safe**
    
    *   Press Reset (R). The display will prompt for a new code.
    *   Enter a 4 digit code and then press Lock (L).
    *   The code will flash. The safe is now locked.
*   **Unlocking the Safe**
    
    *   Enter the 4 digit code.
    *   The safe will flash OPENED if the code is correct. The safe is now open.
    *   If the code is incorrect, the display will flash ERROR and the safe will stay locked.

```ts
/**
 * The state machine's data type
 */
type SafeData = {
    code: Array<number>,
    input: Array<number>,
    timeout: Timeout,
    codeSize: number,
    message?: string
}

export default class HotelSafe extends StateMachine<SafeData> {
    handlers: Handlers<SafeData> = [

        // Clear data when safe enters OPEN
        ['enter#*_#open', () => keepState().data({
            code: {$set: []},
            input: {$set: []},
            message: {$set: 'Open'},
        })],

        // User pressed RESET -- get new code
        ['cast#reset#open', () => nextState('open/locking').data({
            message: {$set: 'Enter Code'},
        })],

        // Track the last {codeSize} digits.
        // show code on display. Repeat state for setting timeout
        ['cast#button/:digit#open/locking', ({args, data}) => {
            let code = pushFixed(Number(args.digit), data.code, data.codeSize)
            return repeatState().data({
                code: {$set: code},
                message: {$set: code.join('')},
            })
        }],

        // User pressed LOCK. CLose safe if code is long enough
        // else, repeat state (sets timeout on reentry)
        ['cast#lock#open/locking', ({data}) =>
            data.code.length !== data.codeSize ?
            repeatState() :
            nextState('closed/success').data({
                message: {$set: `**${data.code.join('')}**`},
            })],

        // Clear input when safe is closed
        ['enter#*_#closed', () => keepState().data({
            input: {$set: []},
            message: {$set: 'Locked'}
        })],

        // Postpone button press and go to closed/unlocking
        ['cast#button/*_#closed', ({}) =>
            nextState('closed/unlocking').postpone()],

        // User entered digit(s).
        // Keep state if code is not long enough
        // OPEN if input matches code
        // go to MESSAGE if code does not match and set a timeout
        ['cast#button/:digit#closed/unlocking', ({args, data}) => {
            let digit = Number(args.digit)
            let input = data.input.concat(digit)

            // code is the correct length. Decision time.
            if (input.length >= data.code.length) {
                let [state, msg] = arrayEqual(data.code, input) ?
                    ['open/success', "Opened"] :
                    ['closed/error', "ERROR"]

                return nextState(state).data({message: {$set: msg}})
            }

            // Not long enough. Keep collecting digits.
            // Show masked code. Repeat state for
            // setting timeout
            return repeatState().data({
                input: {$push: [digit]},
                message: {$set: "*".repeat(input.length)}
            })
        }],

        // These states timeout on inactivity (eventTimeout)
        [['enter#*_#open/locking',
            'enter#*_#closed/unlocking'], ({data}) =>
            keepState().eventTimeout(data.timeout)],

        // these states just timeout
        ['enter#*_#:state/*_', ({data}) =>
            keepState().timeout(data.timeout)],

        // If we timeout in a sub state, go to the base state
        [['genericTimeout#*_#:state/*_',
            'eventTimeout#*_#:state/*_',], ({args}) =>
            nextState(args.state)],
    ]

    initialData: SafeData = {
        code: [],
        codeSize: 4,
        timeout: 200,
        input: [],
    }

    initialState = 'open'

    constructor(timeout: Timeout) {
        super()
        this.initialData.timeout = timeout
    }

    /**
     * Safe Interface. casts 'reset'
     */
    reset() {
        this.cast('reset')
    }

    /**
     * Safe Interface. cast 'lock'
     */
    lock() {
        this.cast('lock')
    }

    /**
     * Safe Interface. send button digit
     * @param digit
     */
    button(digit: number) {
        this.cast({button: digit})
    }
}
```

Here’s the hotel safe’s state diagram. The collection of `open(/*)` states (and likewise, `closed(/*)` states) represents a state machine and the rule of thumb is to implement it in a separate machine. Complex states however, make the job easier for simple hierarchies, as shown above.

![](https://github.com/venkatperi/hotelsafe/blob/master/hotel_safe.svg)

