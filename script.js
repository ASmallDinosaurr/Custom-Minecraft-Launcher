//-- Requirements
const shell = require('electron');  //-- Required for links
const exec = require('child_process').exec;  //-- Required for running CMD to start MC
const myConsole = new require('console').Console(process.stdout,process.stderr);  //-- Required for console messages in HTML file
const fs = require('fs');  //-- File system, required to read/write JSON files
const remote = require('electron').remote;  //-- Required to close app

//-- Links
function link_TSP() {shell.openExternal('https://thespeshalplatoon.com/')};
function link_Discord() {shell.openExternal('https://discord.gg/V5F9Ddm')};
function link_TeamSpeak() {shell.openExternal('ts3server://thespeshalplatoon.com')};
function link_Forgot() {shell.openExternal('https://www.minecraft.net/en-us/password/forgot/')};
function link_Settings() {
    if (document.getElementById("settings").style.right == "0px") {
        document.getElementById("settings").style.right = "-350px";
    } else {
        document.getElementById("settings").style.right = "0px";
    };
};

//-- Declare variables
//var DIR_CUR = 'C:/Users/Administrator/Desktop/TSP_Minecraft';
var DIR_CUR = process.env.PORTABLE_EXECUTABLE_FILE.substr(0, process.env.PORTABLE_EXECUTABLE_FILE.lastIndexOf('\\'));
var DIR_JAVA = DIR_CUR+'/java/bin/javaw.exe'; 
var DIR_GAME = DIR_CUR+'/game/';  
var DIR_USER = DIR_CUR+'/user/';  
var MAX_MEM = '4G';
var MIN_MEM = '2G';
var EMAIL = '';
var PASSWORD = '';
var UNAME = 'Steve';
var UUID = '0f28983a46ce33b1aed45cdc95bf44c3';
var TOKEN = '00000000000000000000000000000000';

loadUserData.call();

//-- Play button, check credentials (Allows for offline mode in no password entered)
function playButton() { 
    //-- Get data from text fields 
    EMAIL = document.getElementById("input_email").value;
    PASSWORD = document.getElementById("input_password").value;     

    if(document.getElementById("input_java").value !== "") {DIR_JAVA = document.getElementById("input_java").value};
    if(document.getElementById("input_game").value !== "") {DIR_GAME = document.getElementById("input_game").value};
    if(document.getElementById("input_user").value !== "") {DIR_USER = document.getElementById("input_user").value};
    
    //-- If no password, do offline mode, else mojang verify
    if (PASSWORD === "") {
        //-- Set uname and launch game
        UNAME = EMAIL;        
        openMC.call();
    } else {
        //-- Payload
        var payload = JSON.stringify({
            "agent": {"name": "Minecraft","version": 1},
            "username": EMAIL,
            "password": PASSWORD,
            "clientToken": "12345678910",
            "requestUser": false
        });        
        //-- Handle request
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState === 4) {  //-- Wait til readystate is done
                var RESULT = JSON.parse(this.responseText); 
                if (xhttp.status  ==  200) {                    
                    UUID = RESULT.selectedProfile.id;
                    TOKEN = RESULT.accessToken;     
                    UNAME = RESULT.selectedProfile.name;               
                    openMC.call();                                      
                } else {
                    document.getElementById("output_loginmsg").innerHTML = "Incorrect. <a onclick = 'link_Forgot()'>Forgot Password?</a>";                    
                };
            };
        };
        //-- Send request
        xhttp.open("POST", "https://authserver.mojang.com/authenticate", true);  //--Open POST to Mojang
        xhttp.setRequestHeader("Content-type", "application/json");  //-- Change header
        xhttp.send(payload);  //-- Send payload
    }; 
};

//-- Select which version to run based on dropdown
function openMC() {
    document.getElementById("output_button").innerHTML = '<i class = "fa fa-refresh fa-spin fa-fast-spin" style = "color:#ffffff"></i>';  //-- Loading Rotaty Thingy
    saveUserData.call(); 
    MIN_MEM = document.getElementById("input_slider").value;
    MAX_MEM = document.getElementById("input_slider").value;     
    if (document.getElementById("input_version").value === "Vanilla") {openMC_Vanilla.call()};
    if (document.getElementById("input_version").value === "Optifine") {openMC_Optifine.call()};
    if (document.getElementById("input_version").value === "Modded") {openMC_Modded.call()};    
    setTimeout(function(){remote.getCurrentWindow().close()}, 10000);  //-- Close app  
};

function openMC_Vanilla() {    
    var NATIVES = ' -Djava.library.path='+DIR_GAME+'versions/1.16.1/natives';
    var LIBRARIES = ' -cp "'+DIR_GAME+'libraries/com/mojang/patchy/1.1/patchy-1.1.jar;'+DIR_GAME+'libraries/oshi-project/oshi-core/1.1/oshi-core-1.1.jar;'+DIR_GAME+'libraries/net/java/dev/jna/jna/4.4.0/jna-4.4.0.jar;'+DIR_GAME+'libraries/net/java/dev/jna/platform/3.4.0/platform-3.4.0.jar;'+DIR_GAME+'libraries/com/ibm/icu/icu4j/66.1/icu4j-66.1.jar;'+DIR_GAME+'libraries/com/mojang/javabridge/1.0.22/javabridge-1.0.22.jar;'+DIR_GAME+'libraries/net/sf/jopt-simple/jopt-simple/5.0.3/jopt-simple-5.0.3.jar;'+DIR_GAME+'libraries/io/netty/netty-all/4.1.25.Final/netty-all-4.1.25.Final.jar;'+DIR_GAME+'libraries/com/google/guava/guava/21.0/guava-21.0.jar;'+DIR_GAME+'libraries/org/apache/commons/commons-lang3/3.5/commons-lang3-3.5.jar;'+DIR_GAME+'libraries/commons-io/commons-io/2.5/commons-io-2.5.jar;'+DIR_GAME+'libraries/commons-codec/commons-codec/1.10/commons-codec-1.10.jar;'+DIR_GAME+'libraries/net/java/jinput/jinput/2.0.5/jinput-2.0.5.jar;'+DIR_GAME+'libraries/net/java/jutils/jutils/1.0.0/jutils-1.0.0.jar;'+DIR_GAME+'libraries/com/mojang/brigadier/1.0.17/brigadier-1.0.17.jar;'+DIR_GAME+'libraries/com/mojang/datafixerupper/3.0.25/datafixerupper-3.0.25.jar;'+DIR_GAME+'libraries/com/google/code/gson/gson/2.8.0/gson-2.8.0.jar;'+DIR_GAME+'libraries/com/mojang/authlib/1.6.25/authlib-1.6.25.jar;'+DIR_GAME+'libraries/org/apache/commons/commons-compress/1.8.1/commons-compress-1.8.1.jar;'+DIR_GAME+'libraries/org/apache/httpcomponents/httpclient/4.3.3/httpclient-4.3.3.jar;'+DIR_GAME+'libraries/commons-logging/commons-logging/1.1.3/commons-logging-1.1.3.jar;'+DIR_GAME+'libraries/org/apache/httpcomponents/httpcore/4.3.2/httpcore-4.3.2.jar;'+DIR_GAME+'libraries/it/unimi/dsi/fastutil/8.2.1/fastutil-8.2.1.jar;'+DIR_GAME+'libraries/org/apache/logging/log4j/log4j-api/2.8.1/log4j-api-2.8.1.jar;'+DIR_GAME+'libraries/org/apache/logging/log4j/log4j-core/2.8.1/log4j-core-2.8.1.jar;'+DIR_GAME+'libraries/org/lwjgl/lwjgl/3.2.2/lwjgl-3.2.2.jar;'+DIR_GAME+'libraries/org/lwjgl/lwjgl-jemalloc/3.2.2/lwjgl-jemalloc-3.2.2.jar;'+DIR_GAME+'libraries/org/lwjgl/lwjgl-openal/3.2.2/lwjgl-openal-3.2.2.jar;'+DIR_GAME+'libraries/org/lwjgl/lwjgl-opengl/3.2.2/lwjgl-opengl-3.2.2.jar;'+DIR_GAME+'libraries/org/lwjgl/lwjgl-glfw/3.2.2/lwjgl-glfw-3.2.2.jar;'+DIR_GAME+'libraries/org/lwjgl/lwjgl-stb/3.2.2/lwjgl-stb-3.2.2.jar;'+DIR_GAME+'libraries/org/lwjgl/lwjgl-tinyfd/3.2.2/lwjgl-tinyfd-3.2.2.jar;'+DIR_GAME+'libraries/com/mojang/text2speech/1.11.3/text2speech-1.11.3.jar;'+DIR_GAME+'versions/1.16.1/1.16.1.jar" net.minecraft.client.main.Main';
    var PARAMS = ' --version 1.16.1 --assetIndex 1.16 --userType mojang --versionType release --assetsDir '+DIR_GAME+'assets';
    var USERPARAMS = ' --username '+UNAME+' --uuid '+UUID+' --accessToken '+TOKEN+' --gameDir '+DIR_USER;
    var RAM = ' -Xmx'+MAX_MEM+'G'+' -Xss'+MIN_MEM+'G';
    var RUN = DIR_JAVA+RAM+NATIVES+LIBRARIES+PARAMS+USERPARAMS+document.getElementById('input_args').value;    
    exec(RUN);  //-- Launch game
};

function openMC_Optifine() {    
    var NATIVES = ' -Djava.library.path='+DIR_GAME+'versions/1.16.1-OptiFine_HD_U_G2_pre4/natives';
    var LIBRARIES = ' -cp "'+DIR_GAME+'libraries/optifine/OptiFine/1.16.1_HD_U_G2_pre4/OptiFine-1.16.1_HD_U_G2_pre4.jar;'+DIR_GAME+'libraries/optifine/launchwrapper-of/2.1/launchwrapper-of-2.1.jar;'+DIR_GAME+'libraries/oshi-project/oshi-core/1.1/oshi-core-1.1.jar;'+DIR_GAME+'libraries/net/java/dev/jna/jna/4.4.0/jna-4.4.0.jar;'+DIR_GAME+'libraries/net/java/dev/jna/platform/3.4.0/platform-3.4.0.jar;'+DIR_GAME+'libraries/com/ibm/icu/icu4j/66.1/icu4j-66.1.jar;'+DIR_GAME+'libraries/com/mojang/javabridge/1.0.22/javabridge-1.0.22.jar;'+DIR_GAME+'libraries/net/sf/jopt-simple/jopt-simple/5.0.3/jopt-simple-5.0.3.jar;'+DIR_GAME+'libraries/io/netty/netty-all/4.1.25.Final/netty-all-4.1.25.Final.jar;'+DIR_GAME+'libraries/com/google/guava/guava/21.0/guava-21.0.jar;'+DIR_GAME+'libraries/org/apache/commons/commons-lang3/3.5/commons-lang3-3.5.jar;'+DIR_GAME+'libraries/commons-io/commons-io/2.5/commons-io-2.5.jar;'+DIR_GAME+'libraries/commons-codec/commons-codec/1.10/commons-codec-1.10.jar;'+DIR_GAME+'libraries/net/java/jinput/jinput/2.0.5/jinput-2.0.5.jar;'+DIR_GAME+'libraries/net/java/jutils/jutils/1.0.0/jutils-1.0.0.jar;'+DIR_GAME+'libraries/com/mojang/brigadier/1.0.17/brigadier-1.0.17.jar;'+DIR_GAME+'libraries/com/mojang/datafixerupper/3.0.25/datafixerupper-3.0.25.jar;'+DIR_GAME+'libraries/com/google/code/gson/gson/2.8.0/gson-2.8.0.jar;'+DIR_GAME+'libraries/org/apache/commons/commons-compress/1.8.1/commons-compress-1.8.1.jar;'+DIR_GAME+'libraries/org/apache/httpcomponents/httpclient/4.3.3/httpclient-4.3.3.jar;'+DIR_GAME+'libraries/commons-logging/commons-logging/1.1.3/commons-logging-1.1.3.jar;'+DIR_GAME+'libraries/org/apache/httpcomponents/httpcore/4.3.2/httpcore-4.3.2.jar;'+DIR_GAME+'libraries/it/unimi/dsi/fastutil/8.2.1/fastutil-8.2.1.jar;'+DIR_GAME+'libraries/org/apache/logging/log4j/log4j-api/2.8.1/log4j-api-2.8.1.jar;'+DIR_GAME+'libraries/org/apache/logging/log4j/log4j-core/2.8.1/log4j-core-2.8.1.jar;'+DIR_GAME+'libraries/org/lwjgl/lwjgl/3.2.2/lwjgl-3.2.2.jar;'+DIR_GAME+'libraries/org/lwjgl/lwjgl-jemalloc/3.2.2/lwjgl-jemalloc-3.2.2.jar;'+DIR_GAME+'libraries/org/lwjgl/lwjgl-openal/3.2.2/lwjgl-openal-3.2.2.jar;'+DIR_GAME+'libraries/org/lwjgl/lwjgl-opengl/3.2.2/lwjgl-opengl-3.2.2.jar;'+DIR_GAME+'libraries/org/lwjgl/lwjgl-glfw/3.2.2/lwjgl-glfw-3.2.2.jar;'+DIR_GAME+'libraries/org/lwjgl/lwjgl-stb/3.2.2/lwjgl-stb-3.2.2.jar;'+DIR_GAME+'libraries/org/lwjgl/lwjgl-tinyfd/3.2.2/lwjgl-tinyfd-3.2.2.jar;'+DIR_GAME+'libraries/com/mojang/text2speech/1.11.3/text2speech-1.11.3.jar;'+DIR_GAME+'libraries/by/ely/authlib/1.5.25.8/authlib-1.5.25.8.jar;'+DIR_GAME+'versions/1.16.1-OptiFine_HD_U_G2_pre4/1.16.1-OptiFine_HD_U_G2_pre4.jar" net.minecraft.launchwrapper.Launch';
    var PARAMS = ' --version 1.16.1-OptiFine_HD_U_G2_pre --assetIndex 1.16 --userType mojang --versionType release --assetsDir '+DIR_GAME+'assets --tweakClass optifine.OptiFineTweaker';
    var USERPARAMS = ' --username '+UNAME+' --uuid '+UUID+' --accessToken '+TOKEN+' --gameDir '+DIR_USER;
    var RAM = ' -Xmx'+MAX_MEM+'G'+' -Xss'+MIN_MEM+'G';
    var RUN = DIR_JAVA+RAM+NATIVES+LIBRARIES+PARAMS+USERPARAMS+document.getElementById('input_args').value;    
    exec(RUN);  //-- Launch game
};

function openMC_Modded() {    
    var NATIVES = ' "-Djava.library.path='+DIR_GAME+'versions/Forge 1.12.2/natives"';
    var LIBRARIES = ' -cp "'+DIR_GAME+'libraries/net/minecraftforge/forge/1.12.2-14.23.5.2854/forge-1.12.2-14.23.5.2854.jar;'+DIR_GAME+'libraries/org/ow2/asm/asm-debug-all/5.2/asm-debug-all-5.2.jar;'+DIR_GAME+'libraries/net/minecraft/launchwrapper/1.12/launchwrapper-1.12.jar;'+DIR_GAME+'libraries/org/jline/jline/3.5.1/jline-3.5.1.jar;'+DIR_GAME+'libraries/com/typesafe/akka/akka-actor_2.11/2.3.3/akka-actor_2.11-2.3.3.jar;'+DIR_GAME+'libraries/com/typesafe/config/1.2.1/config-1.2.1.jar;'+DIR_GAME+'libraries/org/scala-lang/scala-actors-migration_2.11/1.1.0/scala-actors-migration_2.11-1.1.0.jar;'+DIR_GAME+'libraries/org/scala-lang/scala-compiler/2.11.1/scala-compiler-2.11.1.jar;'+DIR_GAME+'libraries/org/scala-lang/plugins/scala-continuations-library_2.11/1.0.2_mc/scala-continuations-library_2.11-1.0.2_mc.jar;'+DIR_GAME+'libraries/org/scala-lang/plugins/scala-continuations-plugin_2.11.1/1.0.2_mc/scala-continuations-plugin_2.11.1-1.0.2_mc.jar;'+DIR_GAME+'libraries/org/scala-lang/scala-library/2.11.1/scala-library-2.11.1.jar;'+DIR_GAME+'libraries/org/scala-lang/scala-parser-combinators_2.11/1.0.1/scala-parser-combinators_2.11-1.0.1.jar;'+DIR_GAME+'libraries/org/scala-lang/scala-reflect/2.11.1/scala-reflect-2.11.1.jar;'+DIR_GAME+'libraries/org/scala-lang/scala-swing_2.11/1.0.1/scala-swing_2.11-1.0.1.jar;'+DIR_GAME+'libraries/org/scala-lang/scala-xml_2.11/1.0.2/scala-xml_2.11-1.0.2.jar;'+DIR_GAME+'libraries/lzma/lzma/0.0.1/lzma-0.0.1.jar;'+DIR_GAME+'libraries/java3d/vecmath/1.5.2/vecmath-1.5.2.jar;'+DIR_GAME+'libraries/net/sf/trove4j/trove4j/3.0.3/trove4j-3.0.3.jar;'+DIR_GAME+'libraries/org/apache/maven/maven-artifact/3.5.3/maven-artifact-3.5.3.jar;'+DIR_GAME+'libraries/net/sf/jopt-simple/jopt-simple/5.0.3/jopt-simple-5.0.3.jar;'+DIR_GAME+'libraries/org/tlauncher/patchy/1.1/patchy-1.1.jar;'+DIR_GAME+'libraries/oshi-project/oshi-core/1.1/oshi-core-1.1.jar;'+DIR_GAME+'libraries/net/java/dev/jna/jna/4.4.0/jna-4.4.0.jar;'+DIR_GAME+'libraries/net/java/dev/jna/platform/3.4.0/platform-3.4.0.jar;'+DIR_GAME+'libraries/com/ibm/icu/icu4j-core-mojang/51.2/icu4j-core-mojang-51.2.jar;'+DIR_GAME+'libraries/net/sf/jopt-simple/jopt-simple/5.0.3/jopt-simple-5.0.3.jar;'+DIR_GAME+'libraries/com/paulscode/codecjorbis/20101023/codecjorbis-20101023.jar;'+DIR_GAME+'libraries/com/paulscode/codecwav/20101023/codecwav-20101023.jar;'+DIR_GAME+'libraries/com/paulscode/libraryjavasound/20101123/libraryjavasound-20101123.jar;'+DIR_GAME+'libraries/com/paulscode/librarylwjglopenal/20100824/librarylwjglopenal-20100824.jar;'+DIR_GAME+'libraries/com/paulscode/soundsystem/20120107/soundsystem-20120107.jar;'+DIR_GAME+'libraries/io/netty/netty-all/4.1.9.Final/netty-all-4.1.9.Final.jar;'+DIR_GAME+'libraries/com/google/guava/guava/21.0/guava-21.0.jar;'+DIR_GAME+'libraries/org/apache/commons/commons-lang3/3.5/commons-lang3-3.5.jar;'+DIR_GAME+'libraries/commons-io/commons-io/2.5/commons-io-2.5.jar;'+DIR_GAME+'libraries/commons-codec/commons-codec/1.10/commons-codec-1.10.jar;'+DIR_GAME+'libraries/net/java/jinput/jinput/2.0.5/jinput-2.0.5.jar;'+DIR_GAME+'libraries/net/java/jutils/jutils/1.0.0/jutils-1.0.0.jar;'+DIR_GAME+'libraries/com/google/code/gson/gson/2.8.0/gson-2.8.0.jar;'+DIR_GAME+'libraries/org/tlauncher/authlib/1.6.25/authlib-1.6.25.jar;'+DIR_GAME+'libraries/com/mojang/realms/1.10.22/realms-1.10.22.jar;'+DIR_GAME+'libraries/org/apache/commons/commons-compress/1.8.1/commons-compress-1.8.1.jar;'+DIR_GAME+'libraries/org/apache/httpcomponents/httpclient/4.3.3/httpclient-4.3.3.jar;'+DIR_GAME+'libraries/commons-logging/commons-logging/1.1.3/commons-logging-1.1.3.jar;'+DIR_GAME+'libraries/org/apache/httpcomponents/httpcore/4.3.2/httpcore-4.3.2.jar;'+DIR_GAME+'libraries/it/unimi/dsi/fastutil/7.1.0/fastutil-7.1.0.jar;'+DIR_GAME+'libraries/org/apache/logging/log4j/log4j-api/2.8.1/log4j-api-2.8.1.jar;'+DIR_GAME+'libraries/org/apache/logging/log4j/log4j-core/2.8.1/log4j-core-2.8.1.jar;'+DIR_GAME+'libraries/org/lwjgl/lwjgl/lwjgl/2.9.4-nightly-20150209/lwjgl-2.9.4-nightly-20150209.jar;'+DIR_GAME+'libraries/org/lwjgl/lwjgl/lwjgl_util/2.9.4-nightly-20150209/lwjgl_util-2.9.4-nightly-20150209.jar;'+DIR_GAME+'libraries/com/mojang/text2speech/1.10.3/text2speech-1.10.3.jar;'+DIR_GAME+'versions/Forge 1.12.2/Forge 1.12.2.jar" net.minecraft.launchwrapper.Launch';
    var PARAMS = ' --version "Forge 1.12.2" --assetIndex 1.12 --userType legacy --versionType Forge --assetsDir '+DIR_GAME+'assets --tweakClass net.minecraftforge.fml.common.launcher.FMLTweaker';
    var USERPARAMS = ' --username '+UNAME+' --uuid '+UUID+' --accessToken '+TOKEN+' --gameDir '+DIR_USER;
    var RAM = ' -Xmx'+MAX_MEM+'G'+' -Xss'+MIN_MEM+'G';
    var RUN = DIR_JAVA+RAM+NATIVES+LIBRARIES+PARAMS+USERPARAMS+document.getElementById('input_args').value;    
    exec(RUN);  //-- Launch game
};

function saveUserData() {    
    var userData = {
        "DIR_JAVA": document.getElementById("input_java").value,
        "DIR_GAME": document.getElementById("input_game").value,
        "DIR_USER": document.getElementById("input_user").value,
        "MAX_MEM": document.getElementById("input_slider").value,
        "MIN_MEM": document.getElementById("input_slider").value,
        "EMAIL": document.getElementById("input_email").value,
        "PASSWORD": document.getElementById("input_password").value,        
        "VERSION": document.getElementById("input_version").value,
        "ARGS": document.getElementById("input_args").value
    };    
    var userDataJSON = JSON.stringify(userData);    
    fs.writeFileSync(DIR_USER+'/tsplauncherdata.json', userDataJSON);
};

function loadUserData() {    
    var data = JSON.parse(fs.readFileSync(DIR_USER+'tsplauncherdata.json'));
    document.getElementById("input_java").value = data.DIR_JAVA;
    document.getElementById("input_game").value = data.DIR_GAME;
    document.getElementById("input_user").value = data.DIR_USER;
    document.getElementById("input_slider").value = data.MIN_MEM;             
    document.getElementById("output").innerHTML = data.MIN_MEM;
    document.getElementById("input_email").value = data.EMAIL;
    document.getElementById("input_password").value = data.PASSWORD;
    document.getElementById("input_version").value = data.VERSION;
    document.getElementById("input_args").value = data.ARGS;
};