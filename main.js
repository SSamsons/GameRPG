// Базовый класс Player
class Player {
    constructor(position, name) {
        this.life = 100;
        this.magic = 20;
        this.speed = 1;
        this.attack = 10;
        this.agility = 5;
        this.luck = 10;
        this.description = 'Игрок';
        this.weapon = new Arm();
        this.position = position;
        this.name = name;
    }

    equipWeapon(weapon) {
        this.weapon = weapon;
        console.log(`${this.name} equipped ${weapon.name}.`);
    }

    displayStats() {
        console.log(
            `Name: ${this.name}, Position: ${this.position}, Life: ${this.life}, Magic: ${this.magic}, Speed: ${this.speed}, Attack: ${this.attack}, Agility: ${this.agility}, Luck: ${this.luck}, Description: ${this.description}`
        );
        if (this.weapon) {
            console.log(
                `Equipped Weapon: ${this.weapon.name} (Attack: ${this.weapon.attack}, Durability: ${this.weapon.durability}, Range: ${this.weapon.range})`
            );
        }
    }

    getLuck() {
        const randomNumber = Math.random() * 100;
        return (randomNumber + this.luck) / 100;
    }

    getDamage(distance) {
        if (distance > this.weapon.range) {
            return 0;
        }
        const weaponDamage = this.weapon.getDamage();
        return (this.attack + weaponDamage) * this.getLuck() / distance;
    }

    takeDamage(damage) {
        this.life = Math.max(this.life - damage, 0);
        console.log(`${this.name} takes ${damage.toFixed(2)} damage. Life: ${this.life}`);
    }

    isDead() {
        return this.life === 0;
    }

    moveLeft(distance) {
        const movement = Math.min(distance, this.speed);
        this.position = Math.max(this.position - movement, 0);
        console.log(`${this.name} moves left to position ${this.position}.`);
    }

    moveRight(distance) {
        const movement = Math.min(distance, this.speed);
        this.position += movement;
        console.log(`${this.name} moves right to position ${this.position}.`);
    }

    move(distance) {
        if (distance < 0) {
            this.moveLeft(-distance);
        } else {
            this.moveRight(distance);
        }
    }

    isAttackBlocked() {
        const blocked = this.getLuck() > (100 - this.luck) / 100;
        if (blocked) console.log(`${this.name} blocked the attack!`);
        return blocked;
    }

    dodged() {
        const dodged = this.getLuck() > (100 - this.agility - this.speed * 3) / 100;
        if (dodged) console.log(`${this.name} dodged the attack!`);
        return dodged;
    }

    takeAttack(damage) {
        if (this.isAttackBlocked()) {
            this.weapon.takeDamage(damage);
        } else if (this.dodged()) {
            return;
        } else {
            this.takeDamage(damage);
        }
    }

    checkWeapon() {
        if (this.weapon.isBroken()) {
            if (this.weapon instanceof Sword) {
                this.equipWeapon(new Knife());
            } else if (this.weapon instanceof Knife) {
                this.equipWeapon(new Arm());
            }
        }
    }

    tryAttack(enemy) {
        const distance = Math.abs(this.position - enemy.position);
        if (distance > this.weapon.range) {
            console.log(`${this.name} cannot reach ${enemy.name}.`);
            return;
        }

        this.weapon.takeDamage(10 * this.getLuck());
        this.checkWeapon();

        const damage = this.getDamage(distance);

        if (this.position === enemy.position) {
            console.log(`${this.name} is attacking ${enemy.name} up close!`);
            enemy.moveRight(1);
            enemy.takeAttack(damage * 2);
        } else {
            console.log(`${this.name} is attacking ${enemy.name} from a distance!`);
            enemy.takeAttack(damage);
        }
    }

    chooseEnemy(players) {
        return players.filter(player => !player.isDead() && player !== this)
                      .reduce((lowest, player) => player.life < lowest.life ? player : lowest, players[0]);
    }

    moveToEnemy(enemy) {
        const distance = this.position - enemy.position;
        if (distance > 0) {
            this.moveLeft(Math.min(distance, this.speed));
        } else if (distance < 0) {
            this.moveRight(Math.min(-distance, this.speed));
        }
    }

    turn(players) {
        const enemy = this.chooseEnemy(players);
        if (!enemy) {
            console.log(`${this.name} has no enemies left to fight.`);
            return;
        }
        console.log(`${this.name} chooses to attack ${enemy.name}.`);
        this.moveToEnemy(enemy);
        this.tryAttack(enemy);
    }
}

function play(players) {
    while (true) {
        const alivePlayers = players.filter(player => !player.isDead());
        if (alivePlayers.length <= 1) break;

        alivePlayers.forEach(player => {
            if (!player.isDead()) {
                player.turn(players);
            }
        });
    }
    const winner = players.find(player => !player.isDead());
    if (winner) {
        console.log(`The winner is ${winner.name}!`);
    } else {
        console.log('No players are left alive.');
    }
}

// Основные персонажи
class Warrior extends Player {
    constructor(position, name) {
        super(position, name);
        this.life = 120;
        this.magic = 20;
        this.speed = 2;
        this.attack = 10;
        this.agility = 0;
        this.luck = 0;
        this.description = 'Воин';
        this.weapon = new Sword();
    }

    takeDamage(damage) {
        if (this.life < 60 && this.getLuck() > 0.8) {
            if (this.magic > 0) {
                this.magic = Math.max(this.magic - damage, 0);
            } else {
                this.life = Math.max(this.life - damage, 0);
            }
        } else {
            this.life = Math.max(this.life - damage, 0);
        }
    }
}

class Archer extends Player {
    constructor(position, name) {
        super(position, name);
        this.life = 80;
        this.magic = 35;
        this.speed = 0;
        this.attack = 5;
        this.agility = 10;
        this.luck = 0;
        this.description = 'Лучник';
        this.weapon = new Bow();
    }

    getDamage(distance) {
        if (distance > this.weapon.range) {
            return 0;
        }
        const weaponDamage = this.weapon.getDamage();
        return (this.attack + weaponDamage) * this.getLuck() * distance / this.weapon.range;
    }
}

class Mage extends Player {
    constructor(position, name) {
        super(position, name);
        this.life = 70;
        this.magic = 100;
        this.speed = 0;
        this.attack = 5;
        this.agility = 8;
        this.luck = 0;
        this.description = 'Маг';
        this.weapon = new Staff();
    }

    takeDamage(damage) {
        if (this.magic > 50) {
            this.life = Math.max(this.life - damage / 2, 0);
            this.magic = Math.max(this.magic - 12, 0);
        } else {
            this.life = Math.max(this.life - damage, 0);
        }
    }
}

// Улучшенные персонажи
class Dwarf extends Warrior {
    constructor(position, name) {
        super(position, name);
        this.life = 130;
        this.magic = 0;
        this.speed = 0;
        this.attack = 15;
        this.agility = 0;
        this.luck = 20;
        this.description = 'Гном';
        this.weapon = new Axe();
        this.hitCount = 0;
    }

    takeDamage(damage) {
        this.hitCount++;
        if (this.hitCount % 6 === 0 && this.getLuck() > 0.5) {
            this.life = Math.max(this.life - damage / 2, 0);
        } else {
            this.life = Math.max(this.life - damage, 0);
        }
    }
}

class Crossbowman extends Archer {
    constructor(position, name) {
        super(position, name);
        this.life = 85;
        this.magic = 0;
        this.speed = 0;
        this.attack = 8;
        this.agility = 20;
        this.luck = 15;
        this.description = 'Арбалетчик';
        this.weapon = new LongBow();
    }
}

class Demiurge extends Mage {
    constructor(position, name) {
        super(position, name);
        this.life = 80;
        this.magic = 120;
        this.speed = 0;
        this.attack = 6;
        this.agility = 0;
        this.luck = 12;
        this.description = 'Демиург';
        this.weapon = new StormStaff();
    }

    getDamage(distance) {
        if (this.magic > 0 && this.getLuck() > 0.6) {
            const weaponDamage = this.weapon.getDamage();
            return 1.5 * (this.attack + weaponDamage) * this.getLuck() / distance;
        } else {
            return super.getDamage(distance);
        }
    }
}

// Базовый класс Weapon
class Weapon {
    constructor(name, attack, durability, range) {
        this.name = name;
        this.attack = attack;
        this.durability = durability; // Прочность
        this.initDurability = durability; // Изначальная прочность
        this.range = range; // Дальность
    }

    takeDamage(damage) {
        if (this.durability !== Infinity) {
            this.durability = Math.max(this.durability - damage, 0);
        }
    }

    getDamage() {
        if (this.durability <= 0) {
            return 0;
        }
        return this.durability >= this.initDurability * 0.3 ? this.attack : this.attack / 2;
    }

    isBroken() {
        return this.durability === 0;
    }

    displayStats() {
        console.log(
            `Name: ${this.name}, Attack: ${this.attack}, Durability: ${this.durability}, Range: ${this.range}`
        );
    }
}

// Основное оружие
class Arm extends Weapon {
    constructor() {
        super('Arm', 1, Infinity, 1);
    }
}

class Sword extends Weapon {
    constructor() {
        super('Sword', 25, 500, 1);
    }
}

class Bow extends Weapon {
    constructor() {
        super('Bow', 10, 200, 3);
    }
}

class Knife extends Weapon {
    constructor() {
        super('Knife', 5, 300, 1);
    }
}

class Staff extends Weapon {
    constructor() {
        super('Staff', 8, 300, 2);
    }
}

// Улучшенное оружие
class LongBow extends Bow {
    constructor() {
        super();
        this.name = 'Long Bow';
        this.attack = 15; // Переопределяем атаку
        this.range = 4; // Переопределяем дальность
    }
}

class Axe extends Sword {
    constructor() {
        super();
        this.name = 'Axe';
        this.attack = 27; // Переопределяем атаку
        this.durability = 800; // Переопределяем прочность
    }
}

class StormStaff extends Staff {
    constructor() {
        super();
        this.name = 'Storm Staff';
        this.attack = 10; // Переопределяем атаку
        this.range = 3; // Переопределяем дальность
    }
}

// Тестирование
const warrior = new Warrior(0, "Алёша Попович");
const archer = new Archer(2, "Леголас");
const dwarf = new Dwarf(5, "Гимли");
const demiurge = new Demiurge(8, "Гендальф");

play([warrior, archer, dwarf, demiurge]);
