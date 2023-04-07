const newWindow = window as any
const Terminal = newWindow.Terminal

function getFormData(form: HTMLFormElement) {
    let formData = new FormData(form)
    let formString = ''
    // iterate through entries...
    for (let pair of formData.entries()) {
      formString += pair[0] + '=' + pair[1] + '&'
    }
    return formString
}

const term = new Terminal({ cursorBlink: true })
//const fitAddon = new FitAddon.FitAddon()
//term._addonManager.loadAddon(fitAddon)
term.open(document.getElementById('terminal') as HTMLElement)
const bufferLength = term.buffer.active.length;

//fitAddon.fit()

interface SSHInfo {
    username: string,
    password: string,
    address: string,
    rows: string,
    cols: string
}

let ws = new WebSocket('ws://localhost')
let ssh_form = document.getElementById('ssh-login') as HTMLFormElement
ssh_form.addEventListener("submit", (e) => {
    e.preventDefault()
    let formData = getFormData(ssh_form)
    let cols = (<Element>ssh_form.elements.namedItem('cols')).innerHTML
    term.resize(Number((<Element>ssh_form.elements.namedItem('cols')).innerHTML), 
    bufferLength + Number((<Element>ssh_form.elements.namedItem('rows')).innerHTML));
    
    ws = new WebSocket(
        'ws://localhost:80/?' + formData
    )

    ws.onmessage = (msg) => {
        let prefix = msg.data.split("|")[0]
        if(prefix == 'msg') {
            (<HTMLElement>document.getElementById('ssh-info')).innerHTML = msg.data.split("|")[1]
        }
        else if(prefix == 'term') {
            term.write(msg.data.split("|")[1])
        }
    }
    // ws.onclose = (e) => {
    //     document.getElementById('ssh-info').innerHTML = 'Oops! Something went wrong!'
    // }
})

let command = ''

// Browser to server
term.onData((e: any) => {
    ws.send('cmd|' + e)
})

//const exampleSocket = new WebSocket(
//    "ws://localhost:80"
//)