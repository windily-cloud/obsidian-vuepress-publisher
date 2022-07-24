import { State } from 'processor/format/state';

export default function text(state: State) {
    state.left++;
    return true;
}
