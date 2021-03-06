require('electron-connect').client.create();
const {ipcRenderer} = require('electron');
const {spawn} = require('child_process');
const os = require('os');
const platform = require('platform');
const storage = require('electron-json-storage');
const alertify = require('alertify.js');

$(() => {
    $(document).foundation();
    // Form
    const $miner = $('#miner');
    const $pool = $('#pool');
    const $pool_raw = $('#pool_raw');
    const $threads = $('#threads');
    const $user = $('#user');
    const $worker = $('#worker');
    const $password = $('#password');
    const $other_pool = $('#other_pool');

    // Information table
    const $os = $('td#os');
    const $ram = $('td#ram');
    const $cpu = $('td#cpu');
    const $hashrate = $('td#hashrate');
    const $valid = $('td#valid');
    const $invalid = $('td#invalid');

    // Buttons
    const $run = $('#run');
    const $save = $('#save');

    storage.get('config', (error, data) => {
        if (error) {
            reject(error);
        }

        $miner.val(data['miner']);
        $pool.val(data['pool']);
        $pool_raw.val(data['other_pool']);
        $threads.val(data['threads']);
        $user.val(data['user']);
        $worker.val(data['worker']);
        $password.val(data['password']);
        if ($pool.val() === 'other') {
            $other_pool.css('display', 'block');
        }
    });

    // Collect miner's info
    $os.text(platform.os.toString());
    $ram.text(Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB');
    $cpu.text(os.cpus()[0]['model']);
    $threads.val(os.cpus().length);

    // Show raw ip:port area when selected other pool
    $pool.change(() => {
        if ($('#pool').val() === "other") {
            $('#other_pool').css('display', 'block');
        } else {
            $('#other_pool').css('display', 'none');
        }
    });

    let child = null;

    // Run miner
    $run.click(() => {
        $run.text((i, text) => {
            if (text === "Run") {
                const command = $miner.val();
                const args = ["-a", "yescrypt", "-o", (() => { return $pool.val() === "other" ? $pool_raw.val() : $pool.val() })(), "-u", $user.val() + "." + $worker.val(), "-p", $password.val(), "-t", $threads.val()];

                console.log(command);
                console.log(args);

                child = spawn(command, args); // TODO: Move to Main process

                // I don't know why all messages to be output to stderr...
                child.stderr.on('data', data_bytes => {
                    const data = data_bytes.toString();
                    console.log(data);
                    const regex = /\[(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\]\s(accepted:\s(\d+)\/(\d+) \((\d+\.\d+%)\), (\d+\.\d+\skhash\/s)\s\S*)/;

                    if (data.match(/Stratum authentication failed/)) {
                        alertify.error("Stratum authentication failed");
                    } else if (data.match(/HTTP request failed/)) {
                        alertify.error(data.match(/\[(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\]\s(.*)/)[2]);
                    }

                    const match = data.match(regex);
                    if (match !== null) {
                        $hashrate.text(match[6]);
                        $valid.text(match[3]);
                        $invalid.text(match[4] - match[3]);
                    }
                });
            } else {
                $hashrate.text("0.00 khash/s");
                $valid.text(0);
                $invalid.text(0);
                child.kill('SIGINT');
            }
            return text === "Run" ? "Stop" : "Run";
        });
    });

    // Save config
    $save.click(() => {
        const data = {
            'miner': $miner.val(),
            'pool': $pool.val(),
            'other_pool': $pool_raw.val(),
            'threads': $threads.val(),
            'user': $user.val(),
            'worker': $worker.val(),
            'password': $password.val()
        };

        storage.set('config', data, error => {
            if (error) throw error;
            alertify.success("Configuration saved successfully!");
        });
    });
});

ipcRenderer.on('can_update', (event, arg) => {
    // Alert
    const $alert = $('#alert');

    $alert.addClass('callout alert');
    $alert.html("<h5>Your manager is outdated!</h5><p>Bitzeny Miner Manager にアップデートがあります: "+arg+" <a href='https://github.com/kalmare/miner-manager/releases'>Download</a></p>");
});
