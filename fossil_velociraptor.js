// fossil_velociraptor.js
// EaglerForge 1.8.8: "Velociraptor" workaround using a tuned Wolf
// Requires: EaglerForge (ModAPI). No custom entity registration is possible in JS.

// utility: say something in chat
function say(msg){ try { ModAPI.displayToChat({ msg: msg }); } catch(e){} }

// On load, we’ll announce and ensure we can touch mc instance
ModAPI.addEventListener("load", function(){
  say("§a[Fossil] Velociraptor mod loaded. Press §eR§a to spawn one.");
});

// Keybind: R spawns/retunes a nearby wolf
ModAPI.addEventListener("key", function(ev){
  // LWJGL keycode for R is 19 (see docs list)
  if(ev.key === 19){
    try {
      // 1) Spawn a wolf using client chat (works SP and servers with perms)
      // ModAPI exposes raw Minecraft instance (mc). We'll use sendChatMessage
      // to run /summon. (Docs: ModAPI.mcinstance exposes Minecraft.) 
      ModAPI.mcinstance.thePlayer.sendChatMessage("/summon Wolf ~ ~1 ~");

      // 2) After a short delay (a few ticks), find the nearest wolf and retune it
      // We’ll poll for ~20 ticks max.
      var ticksLeft = 20;
      var tuned = false;

      var tickFn = function(){
        if(tuned || ticksLeft-- <= 0){
          ModAPI.removeEventListener("update", tickFn);
          if(!tuned) say("§c[Fossil] Couldn't find the spawned wolf to tune.");
          return;
        }

        try {
          // Get player and world from mcinstance
          var mc = ModAPI.mcinstance;
          var player = mc.thePlayer;
          var world = mc.theWorld;

          if(!player || !world) return;

          // Find nearest wolf within 6 blocks
          var list = world.loadedEntityList; // raw Java list
          var px = player.posX, py = player.posY, pz = player.posZ;
          var nearest = null, nd2 = 999;

          for(var i=0;i<list.size();i++){
            var e = list.get(i);
            // Check class name contains "EntityWolf" (1.8.8 MCP)
            if(e && String(e.getClass().getSimpleName()).indexOf("EntityWolf") !== -1){
              var dx = e.posX - px, dy = e.posY - py, dz = e.posZ - pz;
              var d2 = dx*dx + dy*dy + dz*dz;
              if(d2 < nd2 && d2 <= 36) { nearest = e; nd2 = d2; }
            }
          }

          if(nearest){
            // Wrap it as LivingEntityData to use friendly setters
            ModAPI.require("LivingEntityData");
            var ref = nearest; // raw ref
            var le = ModAPI.makeLivingEntityData ? ModAPI.makeLivingEntityData(ref) : null;

            // Fall back: call raw methods if wrapper unavailable
            // Tune attributes to feel like a raptor
            if(le && le.setHealth){
              // health and speed
              le.setHealth({ health: 24.0 });
              // small speed bump using AI move speed
              le.setAIMoveSpeed({ speedIn: 0.39 });
            } else {
              // raw calls (may vary by build)
              try { nearest.setHealth(24.0); } catch(e){}
              try { nearest.setAIMoveSpeed(0.39); } catch(e){}
            }

            // Name it “Velociraptor”
            try { nearest.setCustomNameTag("Velociraptor"); } catch(e){}
            try { nearest.setAlwaysRenderNameTag(true); } catch(e){}

            tuned = true;
            say("§a[Fossil] Velociraptor spawned!");
          }
        } catch(e){}
      };

      ModAPI.addEventListener("update", tickFn);
    } catch(e){
      say("§c[Fossil] Could not execute /summon (no perms?).");
    }
  }
});
