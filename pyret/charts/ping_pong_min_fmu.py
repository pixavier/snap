
from pythonfmu import Fmi2Causality, Fmi2Variability, Fmi2Slave, Boolean, Integer, Real, String
import sdl


sdl.agents = {
    "A": {"state":""}
}


def anim_to(param):

    match param['text']:
        case 'IDLE':
            print(f"Received signal: {param['signal']}, AnimTo: To IDLE")
        case 'RUNNING':
            print(f"Received signal: {param['signal']}, AnimTo: To RUNNING")


def sdl_logic (self, state, signal, param, time): 

    match self:
        case "A":
            match state:
                case 'IDLE':
                    match signal:
                        case 'start':
                            anim_to({"text":"RUNNING","signal":"start"})
                            sdl.send(self, 'stop', 'A', '', 3)
                            sdl.set_state(self, 'RUNNING')

                case 'RUNNING':
                    match signal:
                        case 'stop':
                            anim_to({"text":"IDLE","signal":"stop"})
                            sdl.send(self, 'start', 'A', '', 1)
                            sdl.set_state(self, 'IDLE')

def sdl_start():
    sdl.set_process_event_and_init(sdl_logic)

    # Agent A
    anim_to({"text":"IDLE","signal":"Start"})
    sdl.send('A', 'start', 'A', '', 0)
    sdl.set_state('A', 'IDLE')


class ping_pong_min_fmu(Fmi2Slave):

    author = "XPi"
    description = "A minimal SDL fmu"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.t = 0
        self.next_event_time = 0
        self.agents = ''
        self.look_ahead = ''

        self.register_variable(Real("t", causality=Fmi2Causality.calculatedParameter, variability=Fmi2Variability.fixed))
        self.register_variable(Real("next_event_time", causality=Fmi2Causality.calculatedParameter, variability=Fmi2Variability.fixed))
        self.register_variable(String("agents", causality=Fmi2Causality.calculatedParameter, variability=Fmi2Variability.fixed))
        self.register_variable(String("look_ahead", causality=Fmi2Causality.calculatedParameter, variability=Fmi2Variability.fixed))

        sdl_start()

        
    def do_step(self, current_time, step_size):
        
        sdl.tick()
        self.t = sdl.t
        self.agents = sdl.get_agents()
        self.look_ahead = sdl.look_ahead()
        self.next_event_time = sdl.next_event_time()
        return True


