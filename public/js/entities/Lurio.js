import Entity from '../Entity.js';
import Go from '../traits/Go.js';
import Jump from '../traits/Jump.js';
import Killable from '../traits/Killable.js';
import Physics from '../traits/Physics.js';
import Solid from '../traits/Solid.js';
import Stomper from '../traits/Stomper.js';
import {loadAudioBoard} from '../loaders/audio.js';
import {loadSpriteSheet} from '../loaders/sprite.js';

const SLOW_DRAG = 1/1000;
const FAST_DRAG = 1/5000;

export function loadLurio(audioContext) {
    return Promise.all([
        loadSpriteSheet('lurio'),
        loadAudioBoard('lurio', audioContext),
    ])
    .then(([sprite, audio]) => {
        return createLurioFactory(sprite, audio);
    });
}

function createLurioFactory(sprite, audio) {
    const runAnim = sprite.animations.get('run');

    function routeFrame(lurio) {
        if (lurio.traits.get(Jump).falling) {
            return 'jump';
        }

        if (lurio.traits.get(Go).distance > 0) {
            if ((lurio.vel.x > 0 && lurio.traits.get(Go).dir < 0) || (lurio.vel.x < 0 && lurio.traits.get(Go).dir > 0)) {
                return 'break';
            }

            return runAnim(lurio.traits.get(Go).distance);
        }

        return 'idle';
    }

    function setTurboState(turboOn) {
        this.traits.get(Go).dragFactor = turboOn ? FAST_DRAG : SLOW_DRAG;
    }

    function drawLurio(context) {
        sprite.draw(routeFrame(this), context, 0, 0, this.traits.get(Go).heading < 0);
    }

    return function createLurio() {
        const lurio = new Entity();
        lurio.audio = audio;
        lurio.size.set(14, 16);

        lurio.addTrait(new Physics());
        lurio.addTrait(new Solid());
        lurio.addTrait(new Go());
        lurio.addTrait(new Jump());
        lurio.addTrait(new Killable());
        lurio.addTrait(new Stomper());

        lurio.traits.get(Killable).removeAfter = 0;

        lurio.turbo = setTurboState;
        lurio.draw = drawLurio;

        lurio.turbo(false);

        return lurio;
    }
}
