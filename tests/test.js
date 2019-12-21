const tap = require("tap");
const { Compiler, Blockchain } = require("../src");

tap.tearDown(function() {
	process.exit(0);
});

const ipc = "ipc://./data/geth.ipc";
const rpc = "http://localhost:8545";

const local = Blockchain.at(ipc);
const remote = Blockchain.at(rpc);

tap.test("block number", async function(t) {
	const n1 = await local.blockNumber();
	const n2 = await remote.blockNumber();
	t.ok(n1 > 0, "Non-zero block number");
	t.ok(n1 === n2, "Same block number");
});

tap.test("block retrieval", async function(t) {
	const block = await local.block(1);
	t.type(block, "object");
});

tap.test("users", async function(t) {
	const m =
		"science truck gospel alone trust effort scorpion laundry habit champion magic uncover";
	const alice = await remote.userFromMnemonic(m, 0);
	const bob = await remote.userFromMnemonic(m, 1);
	t.notEqual(alice.address(), bob.address());
});

// tap.test("ipc user", async function(t) {
// 	const god = await local.user();
// 	t.notEqual((await god.balance()).toString(), "0", "god has ether");
// 	console.log("god is at", god.address());

// 	const someOtherUser = await local.userFromMnemonic(
// 		"maid large usual there sample dentist athlete eager shoe kitten worth vacuum",
// 		0
// 	);
// 	t.equal(
// 		someOtherUser.address(),
// 		"0x5e94baef74b60e98116b971e9240d914f4059e27"
// 	);
// 	t.equal(await someOtherUser.balance(), "0");
// });

tap.test("eth transfer", async function(t) {
	const god = await local.user();
	const alice = await remote.user(
		"science truck gospel alone trust effort scorpion laundry habit champion magic uncover"
	);
	const r = god.give(alice, 1).then(tr => tr.success());
	t.resolves(r);
});

tap.test("compiler options", async function(t) {
	const a = new Compiler({ "evm-version": "spuriousDragon" });
	const b = new Compiler({ "evm-version": "byzantium" });
	const path = "tests/TokenERC20";
	const [image1, image2] = await Promise.all([
		a.compile(path),
		b.compile(path)
	]);
	t.notEqual(image1.bin, image2.bin);
});
