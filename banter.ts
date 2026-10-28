// tslint:disable
/* eslint-disable */
import { CrewMember, CrewPost, Species } from './App';

// ============================================================================
// STEP 12: THE COMEDY LAYER & BANTER SYSTEM
// ============================================================================

export type BanterEventType =
  | 'starport_ops'
  | 'starport_personnel'
  | 'starport_crew'
  | 'starport_bank'
  | 'starport_ship_config'
  | 'starport_trade'
  | 'starport_docking'
  | 'train_science'
  | 'train_navigation'
  | 'train_engineering'
  | 'train_comms'
  | 'train_medicine'
  | 'buy_module'
  | 'sell_module'
  | 'buy_mineral'
  | 'sell_mineral'
  | 'buy_fuel'
  | 'appraise_artifact'
  | 'sell_artifact'
  | 'ship_name_changed'
  | 'launch'
  | 'orbit_enter'
  | 'break_orbit'
  | 'landing_start'
  | 'touchdown'
  | 'rover_deploy'
  | 'rover_drive'
  | 'rover_board'
  | 'mining_pickup'
  | 'lifeform_scan'
  | 'specimen_capture'
  | 'alien_contact'
  | 'alien_hail'
  | 'alien_question'
  | 'combat_hit'
  | 'combat_miss'
  | 'combat_kill'
  | 'shields_raise'
  | 'shields_drop'
  | 'shields_absorb'
  | 'shields_collapse'
  | 'repair_start'
  | 'repair_complete'
  | 'repair_abort'
  | 'distress_tow'
  | 'starmap_open'
  | 'starmap_select'
  | 'flux_jump';

export interface BanterLine {
  id: string;
  text: string;
}

export interface PairedExchange {
  id: string;
  speaker1Post: CrewPost;
  line1: string;
  speaker2Post: CrewPost;
  line2: string;
}

// Running Gag Docker Nicknames
export const DOCKER_NICKNAMES = [
  'The Flying Filing Cabinet',
  "Interstel's Depreciation Write-Off",
  'The Subspace Toaster',
  'The Rusty Asteroid Anchor',
  'The Galactic Lunchbox',
  "Interstel's Insurance Liability",
  'The Pressurized Biscuit Tin',
  'The Orbital Paperweight',
];

// ----------------------------------------------------------------------------
// 1. EXTENSIVE BANTER LIBRARY (>= 4 lines per event per race)
// ----------------------------------------------------------------------------
export const RACE_BANTER_LIBRARY: Record<Species, Partial<Record<BanterEventType, string[]>>> = {
  Human: {
    starport_ops: [
      'Look at all these exploration directives! I already laminated three copies of the safety bylaws.',
      "Form 12-B clearly states we are entitled to free synthetic coffee while reviewing charters.",
      "Captain, I took the liberty of color-coding the colonization guidelines alphabetically.",
      'If we follow Interstel Regulation 804 subsection C, nothing can possibly go wrong!',
    ],
    starport_personnel: [
      'The Academy simulators gave me a 98% in theoretical enthusiasm! Practical survival was a solid 62%.',
      'I heard if you do fifty pushups in the gravity gym, your laser aiming accuracy jumps by 2%.',
      'Look at these training modules! Can we expense the Advanced Protocol Seminar to Interstel?',
      "I love academy refreshers! It's just like high school, but with vacuum exposure risks.",
    ],
    starport_crew: [
      'Bridge assignments finalized! I have already labeled everyone’s duty lockers with cheerful stickers.',
      'According to the crew charter, the Captain gets first dibs on the comfortable swivel chair.',
      'All posts manned! Remember crew: team synergy increases operational throughput by 14%!',
      'I practiced my authoritative bridge salute in the bathroom mirror for twenty minutes.',
    ],
    starport_bank: [
      'Compound interest at 12% per annum! In three centuries, our descendants will be planetary barons!',
      'Should we ask for a low-interest exploration stipend, or just sell another ton of gravel?',
      'Interstel Bank statements are my favorite bedtime reading. So many neat columns!',
      'I love the smell of freshly minted M.U. credit vouchers in the morning.',
    ],
    starport_ship_config: [
      'Look at those shiny new bulkheads! The gantry crew only left two loose bolts in the airlock.',
      'The dockers are calling our ship "The Subspace Toaster" again, but I think she has real character!',
      'Can we install the Class 3 deflector screens? They match our jumpsuit trim perfectly.',
      'I double-checked the hull warranty. It covers everything except collisions, lasers, and space.',
    ],
    starport_trade: [
      'Promethium is up 4% this quarter! My planetary stock index newsletter was actually right!',
      'Is it against regulations to trade ancient Precursor relics for souvenir keychains?',
      'I love the Trade Depot! The smell of hot sulfur and haggling merchants really feels like home.',
      'Remember: buy low, sell high, and always demand receipt Interstel Form 202-A!',
    ],
    starport_docking: [
      'Pre-flight checklist item 417: ensure all emergency snack rations are secured.',
      'Docking clamps disengaged! Let us venture forth and boldly fill out standardized survey forms!',
      'I polished the dashboard dials. Try not to smudge the primary navigation chronometer!',
      'Starport Arth Control just cleared us for launch! Remember to wave to the traffic controllers.',
    ],
    launch: [
      'Thrusters cleared! Let us boldly go where at least three prior expeditions vanished mysteriously!',
      'Interstel Launch Mandate in effect! Seatbelts fastened, tray tables stowed!',
      'Look at Arth shrinking in the aft monitor! I forgot to turn off the coffee machine in my quarters.',
      'Escape velocity achieved! My stomach is currently somewhere back near the docking gantry.',
    ],
    orbit_enter: [
      'Established standard synchronous orbit! The geography textbook was right, it really is spherical!',
      'Telemetry synchronized! Let me grab my binoculars to look for alien gift shops.',
      'Stable orbit achieved! Gravitational parameters match Interstel Standard Orbit Manual page 44.',
      'Entering orbital plane. Captain, shall I prepare the ceremonial planetary log entry?',
    ],
    break_orbit: [
      'Breaking orbit! Firing sublight thrusters according to orbital departure vector Delta-7.',
      'Leaving planetary gravity well! Good bye world, we barely scratched your surface!',
      'Orbital escape trajectory plotted. Thrusters hum with textbook efficiency!',
      'Ascending out of the gravity trough! Interstel speed limit regulations do not apply here, right?',
    ],
    landing_start: [
      'Initiating atmospheric entry burn! The manual says hull vibration is completely normal up to 4G!',
      'Descent trajectory locked! Hold onto your seat cushions, everyone!',
      'Heat shield tiles glowing pleasant cherry red! Exactly as demonstrated in Chapter 4!',
      'Target landing coordinates verified! Aiming for the flat part without the active volcanoes.',
    ],
    touchdown: [
      'Touchdown! That landing was so smooth, my tea barely spilled over the instrument panel!',
      'Hydraulic struts locked! We have successfully touched uncharted alien soil!',
      'Engine cut-off complete! Atmospheric sensors reading... well, mostly breathable!',
      'Surface contact confirmed! Time to put on our freshest boots and make history.',
    ],
    rover_deploy: [
      'Terrain Vehicle deployed! The suspension smells like brand new synthetic rubber!',
      'Rover cargo ramp lowered! Remember crew, the speed limit on alien worlds is purely advisory.',
      'Six-wheel drive engaged! Let us find some rocks to scientifically poke!',
      'Rover systems online! I brought extra spare tires and a thermal flask of soup.',
    ],
    rover_drive: [
      'Whoa! That crater was bigger than it looked on the topographical radar!',
      'Enjoying the scenic alien vistas! Look at that lovely purple boulder over there!',
      'Navigating planetary terrain! My driving instructor on Arth would be terrified right now.',
      'Bouncing over the dunes! The suspension is doing 90% of the emotional labor here.',
    ],
    mining_pickup: [
      'Tractor beam lock! Look at that high-grade ore chunk! That will buy a lot of freeze-dried rations.',
      'Mineral payload secured in hold! Interstel Resource Bureau is going to love this.',
      'Scooped up raw mineral node! My metal detector app actually worked!',
      'Cargo pods filling nicely! That is honest M.U. revenue right there.',
    ],
    lifeform_scan: [
      'Lifeform detected on sensors! It has too many legs to be friendly, but let us say hello!',
      'Bio-scanner active! Fascinating cellular structure... looks a bit like overgrown asparagus.',
      'Scanning local fauna! I am naming this species "Jax’s Fluffy Wonder-Beast" in the log.',
      'Bio-telemetry logged! Interstel Zoological Institute pays top M.U. for this data!',
    ],
    specimen_capture: [
      'Specimen safely contained in bio-cage! Do not tap on the glass, it gets grumpy.',
      'Captured lifeform! Quick, what does the handbook say about feeding tentacled quadrupeds?',
      'Bio-containment field active! That is one for the Arth Natural History Museum!',
      'Specimen secured! It is making squeaking noises that sound vaguely like polite insults.',
    ],
    alien_contact: [
      'Alien contact! Captain, remember First Contact Protocol: smile warmly and do not mention food.',
      'Subspace comms channel hailing! Should I open with "Greetings from Arth" or a formal bow?',
      'Unknown vessel on tactical grid! I hope they appreciate Interstel trade brochures.',
      'Alien ships detected! My heart rate is currently 140 BPM of pure diplomatic enthusiasm!',
    ],
    alien_hail: [
      'Subspace hail transmitted! Sending standard Interstel peace greetings on all frequencies.',
      'Hailing alien vessel! I set the universal translator to "Extra Polite Generalist".',
      'Opening channel! Let us make friends and maybe negotiate a bulk mineral discount.',
      'Transmitting greeting packet! Fingers crossed their culture does not consider blinking an insult.',
    ],
    alien_question: [
      'They are asking us a direct question! Quick, what does Interstel diplomacy regulation 12 say?',
      'Alien query incoming! Captain, answer with supreme confidence and gentle posture!',
      'They want an answer! I hope "Yes" does not mean "Please vaporize our fuel tanks" in their dialect.',
      'Direct inquiry on comms! Think diplomatic thoughts, crew!',
    ],
    combat_hit: [
      'Direct hit on hostile vessel! Textbook trajectory calculation, just like the simulator!',
      'Laser strike confirmed! Target armor displacement visible on tactical overlay!',
      'Bullseye! We actually hit them! I mean... of course we hit them, precision marksmanship!',
      'Target shields disrupted! Keep up the pressure, tactical team!',
    ],
    combat_miss: [
      'Shot went wide! Recalibrating targeting crosshairs for solar wind drift!',
      'Missed by three meters! That was a warning shot! Standard warning shot protocol!',
      'Target took evasive action! Adjusting fire deflection angles!',
      'Laser beam dispersed over range! Closing tactical distance for better accuracy!',
    ],
    combat_kill: [
      'Hostile target neutralized! Hull fracture confirmed, salvage cargo drifting!',
      'Target vessel destroyed! That was intense! Let us tractor in the debris before it scatters!',
      'Tactical victory! Interstel Defense Mandate fulfilled without a single scratch on our paint!',
      'Target down! Whew... my hands are shaking, but in an heroic, professional way!',
    ],
    shields_raise: [
      'Deflector shields raised! Harmonic barrier humming at a very reassuring frequency.',
      'Shield matrix active! Feels good to have two thousand points of forcefield between us and the void.',
      'Deflectors online! Power draw is nominal according to Interstel safety curves.',
      'Shield bubble established! We are officially wrapped in glowing blue protection!',
    ],
    shields_drop: [
      'Shields dropped to standby! Reactor load decreased by 18%.',
      'Lowering deflector screens. Saving vital Endurium fuel for sublight thrusters.',
      'Shields down. Let us hope the neighbors are in a peaceful mood today.',
      'Deflector harmonizers powered down to cooling cycle.',
    ],
    shields_absorb: [
      'Shields absorbed incoming impact! Energy dissipated across deflector coils!',
      'Deflectors holding! That blast barely tickled the secondary harmonics!',
      'Impact deflected! The shield generator is earning every single credit we paid for it!',
      'Shield absorption confirmed! Capacitors recharged and ready for more!',
    ],
    shields_collapse: [
      'Deflector shields collapsed! We are on raw hull armor now, people!',
      'Shield generators overloaded! Diverting auxiliary emergency power to bulkhead seals!',
      'Shields down under heavy fire! Evasive maneuvers, Captain!',
      'Harmonic barrier broken! Hang onto your helmets, incoming fire is direct!',
    ],
    repair_start: [
      'Began field repairs using cargo minerals! I am following the illustrated repair manual step-by-step.',
      'Patching up damaged systems! A little aluminum alloy and elbow grease will fix this right up.',
      'Repair protocol active! Hand me the hydro-spanner and the instruction booklet!',
      'Restoring subsystem integrity! Good thing we stocked up on raw metals at the depot.',
    ],
    repair_complete: [
      'Subsystem repairs 100% complete! Diagnostics returning all green lights!',
      'Fixed and certified nominal! She runs smoother than the day we left Starport Arth!',
      'Repairs finished! Not a single spare screw left over... okay, maybe one, but it is fine.',
      'Subsystem back online! You see? Trust the Interstel maintenance guidelines!',
    ],
    repair_abort: [
      'Repair task halted. Conserving remaining mineral reserves in cargo hold.',
      'Paused maintenance work. Standing by for further command directives.',
      'Repair cycle aborted. We will finish welding the conduits later.',
      'Tools packed away. Resuming standard bridge alert level.',
    ],
    distress_tow: [
      'Distress beacon activated! The Interstel tow ship is coming to haul our embarrassing mistakes home.',
      'Towing invoice acknowledged. 15,000 M.U. is steep, but breathing oxygen is definitely worth it.',
      'Tow cable attached. The rescue crew is laughing at us over the subspace frequency.',
      'Starport tow tractor engaged. Time to practice our most apologetic expressions for the portmaster.',
    ],
    starmap_open: [
      'Holographic starmap online! Look at all these uncharted systems waiting for our discovery flags!',
      'Opening quadrant map! Two hundred and fifty parsecs of pure exploratory potential!',
      'Starmap active! I highlighted the stars with habitable spectral classifications in yellow.',
      'Quadrant chart projected. The galaxy looks so neat and tidy in miniature!',
    ],
    starmap_select: [
      'Plotting jump trajectory to target star! Warp fuel consumption calculated precisely.',
      'Target system selected! Checking stellar archives for known alien territory boundaries.',
      'Course coordinates locked into navigation buffer! Ready on your command, Captain!',
      'Target star locked! That spectral class promises high mineral density and mild weather!',
    ],
    flux_jump: [
      'Entering Continuum Flux! Everything looks like a kaleidoscopic watercolor painting!',
      'Flux rift traversal complete! We just skipped twenty light-years in zero seconds flat!',
      'Continuum warp active! My teeth are vibrating, but my chronometer says we arrived instantly!',
      'Spatial displacement successful! That is what I call high-efficiency commuting!',
    ],
    train_science: [
      'Studied planetary spectroscopy! I now know forty-seven different ways to say "rock".',
      'Advanced sensor calibration training complete! My scanner readouts will be 15% sharper.',
      'Science coursework finished! I can now distinguish between toxic methane and alien swamp gas.',
      'Completed astrophysics seminar! The instructor said my hypothesis on nebula ionization was "not entirely disastrous"!',
    ],
    train_navigation: [
      'Hyperspace vector navigation drills complete! I only got lost in the simulated void twice!',
      'Course plotting speed increased! My slide-rule technique is becoming legendary.',
      'Passed sublight orbital mechanics! I now calculate gravitational slingshots in my head.',
      'Navigation certification renewed! I promise not to mistake a pulsar for a starport beacon again.',
    ],
    train_engineering: [
      'Studied warp manifold diagnostics! I now know which red flashing lights to worry about first.',
      'Completed structural stress mechanics! I can patch a micrometeoroid puncture in under twelve seconds.',
      'Engineering seminar finished! Learned the proper torque specifications for titanium hull rivets.',
      'Reactor maintenance certification obtained! The instructor said my plasma containment was "acceptable for government work"!',
    ],
    train_comms: [
      'Studied xenolinguistic dialects! I learned how to apologize in thirty-two alien languages.',
      'Completed subspace signal modulation! My decryption speed on garbled transmissions is way up.',
      'Diplomatic rhetoric seminar passed! I can now sound 20% more persuasive on open channels.',
      'Advanced translator calibration finished! Less static, more nuanced alien greetings.',
    ],
    train_medicine: [
      'Completed emergency trauma surgery simulation! The dummy survived with only minor robotic burns.',
      'Studied xenobiology pharmacology! I now know which alien herbs act as natural painkillers.',
      'Passed triage diagnostics! Vitality recovery rates under my care will be much more consistent.',
      'Medical certification updated! Bandages, stim-packs, and soothing bedside manner all certified Grade-A.',
    ],
    buy_module: [
      'New module installed! The invoice was hefty, but our starship capabilities just skyrocketed!',
      'Upgraded ship components! I already read the entire 400-page installation manual.',
      'Shiny new equipment secured in the gantry! That should give us a major tactical edge.',
      'Component purchase logged in Interstel asset ledger Form 104-D!',
    ],
    sell_module: [
      'Old module sold back to the shipyard! Cleaned up our mass budget and topped off the treasury.',
      'Surplus component liquidated! Every extra M.U. helps fund our exploration grant.',
      'Sold off obsolete hardware. Less dead weight means better fuel mileage!',
      'Module sale finalized. The shipyard foreman looked surprisingly pleased with that trade.',
    ],
    buy_mineral: [
      'Purchased mineral stock! Better to have excess aluminum in the hold than regret it during repairs.',
      'Ore transaction complete! Restocked essential engineering repair materials.',
      'Mineral shipment loaded into cargo pods! Ready for deep space fabrication needs.',
      'Bought raw metals at market rate. Good insurance against unexpected micrometeorite storms.',
    ],
    sell_mineral: [
      'Sold raw minerals for pure M.U. profit! Interstel commodity market was generous today.',
      'Cashed in our surface haul! Mining hard work pays off in cold hard credits!',
      'Mineral sale processed! That ore was heavy, but the credit voucher is wonderfully light.',
      'Cargo hold cleared and treasury replenished! Time to find another rich mineral world.',
    ],
    buy_fuel: [
      'Tanks topped off with pure Endurium! The reactor hums with fresh crystalline power.',
      'Purchased fuel canisters! Never venture into deep hyperspace on a quarter tank.',
      'Endurium tanks fully primed! We have enough range to cross half the quadrant.',
      'Fuel transaction logged! The blue glow in the fuel lines is utterly hypnotic.',
    ],
    appraise_artifact: [
      'Artifact appraised by the archaeological bureau! Turned out to be worth a fortune!',
      'Relic deciphered! Fascinating Precursor quantum circuits inside this ancient device.',
      'Appraisal complete! That strange glowing artifact is an authentic ancient masterwork!',
      'The appraisal fee was worth every credit! Now we know its true scientific and market value.',
    ],
    sell_artifact: [
      'Precursor relic sold to Interstel Antiquities! A massive deposit in our operating treasury!',
      'Artifact transaction finalized! That ancient curio just funded our entire next expedition.',
      'Sold relic to the museum curator. They were practically weeping with archaeological joy.',
      'Ancient artifact liquidated! Interstel exploration grant goals successfully exceeded!',
    ],
    ship_name_changed: [
      'New ship name registered with Starport Registry! I already repainted the hull stencils.',
      'Transponder beacon updated! She carries her new name with true exploratory pride.',
      'Official registry updated! No more dockers calling us "The Flying Filing Cabinet"!',
      'Name change processed on Form REG-01! May our voyages under this title be legendary!',
    ],
  },

  Velox: {
    starport_ops: [
      'Charters? Directives? Point this chitinous prow at hostile territory and let the plasma burn!',
      'Operations paperwork is for soft-shelled larvae. Give me high-output warp coordinates!',
      'I do not care about colonial zoning laws. Are there asteroids to pulverize or not?!',
      'Interstel Form 804 can burn in the exhaust manifold. We fly fast or we do not fly!',
    ],
    starport_personnel: [
      'Training? Give me twenty minutes in the engine room with a hydro-torch and I will teach the ship respect!',
      'The academy virtual simulator has no appreciation for raw engine redline torque!',
      'I need engineers who do not cry when a plasma conduit vents hot coolant on their carapace!',
      'Train skills high! When the manifold explodes, fast claw reflexes are the only insurance!',
    ],
    starport_crew: [
      'Stations assigned! Keep the weak-clawed crew away from my plasma injector overrides!',
      'Engineer station is mine! If anyone touches the throttle mixture, I will bite their antenna off!',
      'Crew roster verified. Soft biologicals at tactical, hardened chitin at the reactor core!',
      'Ready on all posts! If the engines do not scream at 10,000 RPM, you are not flying properly!',
    ],
    starport_bank: [
      'Bank loans? Take all the M.U. they have and spend it on Class 5 Singularity Warps!',
      'Credits are just fuel waiting to be converted into explosive kinetic thrust!',
      'Interest rate of 12%? If we fly fast enough, the debt collectors can never intercept us!',
      'Give me credits to buy titanium reinforcement plates before the reactor melts the hull!',
    ],
    starport_ship_config: [
      'Rip out the science labs and install three more fusion booster manifolds!',
      'The dockers call her "The Subspace Toaster"? I will toast their entire gantry with my exhaust plume!',
      'Class 5 Antimatter Jet! Now THAT is a power plant worthy of Velox chitin!',
      'More thrust! If the hull plates are not groaning under acceleration, the engine is asleep!',
    ],
    starport_trade: [
      'Endurium! High-octane crystalline reactor food! Buy every single cubic meter on the floor!',
      'Molybdenum nozzles for thruster cooling! Buy them before the market opens!',
      'Why trade useless trinkets when we can buy high-tensile titanium armor blocks?!',
      'The Trade Depot clerk tried to short-change me. My mandibles convinced him otherwise.',
    ],
    starport_docking: [
      'Disengage docking clamps NOW! The plasma injector is rattling with glorious impatience!',
      'Clear the gantry doors or we will vaporize them on the way out!',
      'Pre-flight check: throttle to MAXIMUM, safeties OFF, prayer to the Great Queen of Speed!',
      'Gantry locks released! Let the void feel the fury of our combustion chambers!',
    ],
    launch: [
      'FULL THROTTLE! Listen to those injectors roar! Chitin vibrating at harmonic frequency!',
      'Gantry cleared at 400 meters per second! The traffic controller is choking on our ion wake!',
      'Combustion chambers at 140% nominal! That is how a Velox leaves orbit!',
      'HA! Gravity tries to hold us, but raw plasma thrust tears the sky open!',
    ],
    orbit_enter: [
      'Orbit achieved, but we are moving too slow! Slingshot around the dark side for speed!',
      'Orbital lock engaged. The engines hate idling, Captain. Give them work to do!',
      'Circling this mud ball! Gravity is just a tether waiting to be snapped by full throttle!',
      'Stabilized in orbit. I am venting auxiliary heat into the upper atmosphere to keep the core hungry.',
    ],
    break_orbit: [
      'FIRING MAIN THRUSTERS! Break this gravity cage and let us tear into deep space!',
      'Escape burn engaged! The g-forces are flattening my thorax, GLORIOUS!',
      'Leaving orbit! Watch the velocity needle bend into the red zone!',
      'Orbital escape trajectory smashed! Sublight engines roaring with proper Velox fury!',
    ],
    landing_start: [
      'Atmospheric re-entry! The heat shield is screaming like a stepped-on beetle! PERFECT!',
      'Descent angle 45 degrees! Do not touch the retro-brakes until the trees are visible!',
      'Diving through the cloud deck! The hull friction heat could melt aluminum!',
      'Hold onto your carapaces! We are dropping like an angry meteor!',
    ],
    touchdown: [
      'SLAMMED onto the dirt! Landing struts took the shock like true titanium pistons!',
      'Touchdown! Smoke pouring off the brake pads! That was a REAL landing!',
      'We are down! The ground cratered three feet under our landing pads! Excellent traction!',
      'Engine cut! The cooling vents are hissing sweet steam across the alien grass.',
    ],
    rover_deploy: [
      'Drop the ramp! The rover has six heavy wheels and an engine that begs for violent acceleration!',
      'Terrain Vehicle deployed! I bypassed the speed governor before we left the bay!',
      'Rover engines revving! Let us leave tire ruts across this virgin planetary crust!',
      'Disembark! If a hill is too steep, add more throttle until physics surrenders!',
    ],
    rover_drive: [
      'FULL SPEED over the ridges! Four wheels off the ground is standard operating procedure!',
      'Look at that dust plume behind us! That is twenty meters of pure Velox horsepower!',
      'Crater jump! Carapace rattled, suspension maxed, completely exhilarating!',
      'Steering with the rear wheels! The rover drifts like a predatory mantis!',
    ],
    mining_pickup: [
      'RAW TITANIUM! Chomp it into the hold! We will forge it into thruster cowlings!',
      'Tractor beam engaged! More metal for the ship, more mass for the engines to haul!',
      'Scooped the mineral deposit! High density, heavy weight, perfect ballast!',
      'Ore secured! The cargo winches groaned, but my chitinous claws held firm!',
    ],
    lifeform_scan: [
      'Target scanned! It has claws, teeth, and bad attitude! I respect this creature!',
      'Bio-signature locked! Can we eat it, or will it melt our stomach acid?',
      'Fauna detected! It charged our sensors! Good, a planet with fighting spirit!',
      'Scan complete. Soft-shelled organism with poor armor plating. Easily subdued!',
    ],
    specimen_capture: [
      'Caged the beast! It tried to bite my antenna, so I showed it what Velox mandibles look like!',
      'Specimen captured! The containment bars are bending, but it is trapped good!',
      'Locked in the bio-hold! That creature will fetch a mountain of Endurium on Arth!',
      'Secured in cage! It is hissing at the lights. A truly magnificent warrior specimen!',
    ],
    alien_contact: [
      'Hostile vessels on grid! FINALLY, something worthy of laser fire and ramming speed!',
      'Alien fleet detected! Arm the missile pods before they even think about hailing!',
      'Contact! Let them see the predatory silhouette of our battle-tested prow!',
      'Foreign warships on tactical! I am pre-heating the plasma conduits to melting point!',
    ],
    alien_hail: [
      'Hailing? Why talk when we have Class 4 Plasma Cannons charged and ready?!',
      'Opening comms channel. If they insult our speed, I fire the forward torpedo tubes!',
      'Subspace link established. Tell them we demand unconditional right-of-way!',
      'Comms open. Hear those chitinous clicks? That is the sound of Velox tactical superiority!',
    ],
    alien_question: [
      'They question us? Answer with strength or answer with torpedoes!',
      'Alien query on terminal! Tell them we fear nothing in this quadrant!',
      'They want compliance! Velox do not bow to soft-shelled squids!',
      'Answer fast, Captain, before my claw slips onto the primary fire trigger!',
    ],
    combat_hit: [
      'DIRECT HIT! Their armor plating peeled like rotten bark! FIRE AGAIN!',
      'PULVERIZED their starboard shields! Hear that secondary explosion?! GLORIOUS!',
      'Laser core punched clean through their hull! That is the power of calibrated optics!',
      'CRITICAL STRIKE! Target vessel leaking atmosphere and panic into the vacuum!',
    ],
    combat_miss: [
      'MISS?! The targeting computer is sabotaging my shot! Manual overrides engaged!',
      'Shot wide! Navigator, stop twitching the helm or I will weld your chair to the floor!',
      'Missed target coordinates! Load the heavy warheads, we need bigger blast radiuses!',
      'Laser dispersed! CLOSE THE DISTANCE! I want to see their faceplate rivets melt!',
    ],
    combat_kill: [
      'OBLITERATED! Shattered into a thousand burning scrap metal fragments! HAHAHA!',
      'TARGET DESTROYED! The void claims another foolish challenger! REAP THE SALVAGE!',
      'TACTICAL EXTERMINATION! Their core went nova! That is how the Veloxi Hive settles disputes!',
      'Vessel crushed! Vacuum swallowed their distress beacon! Clear the grid for more targets!',
    ],
    shields_raise: [
      'Deflector shields charged! Harmonizer coils screaming at peak resonance!',
      'Shield barrier locked! Let their pathetic lasers splash harmlessly against our field!',
      'Deflectors at maximum! The generator is drawing heavy juice, but she holds solid!',
      'Shields UP! Like an impenetrable chitin carapace around our hull!',
    ],
    shields_drop: [
      'Dropping shields! Route that surplus power directly into the sublight thruster coils!',
      'Shields lowered. We do not need defensive bubbles when we can outrun everything!',
      'Deflector offline. Engine output jumped by 200 megawatts!',
      'Screens down. Reactor cooling cycle initiated.',
    ],
    shields_absorb: [
      'Shields took the blow! The harmonizers laughed at that kinetic pea-shooter!',
      'Direct impact absorbed! Deflector coils barely broke a sweat!',
      'Shield held firm! Their weapons are as weak as newborn larvae!',
      'Forcefield deflected the shot! Keep firing, our bubble is unbreakable!',
    ],
    shields_collapse: [
      'SHIELDS SHATTERED! The harmonizer fried! NOW WE FIGHT WITH BARE CARAPACE!',
      'Deflectors collapsed under barrage! All armor plates brace for direct impact!',
      'Shield bubble burst! Reroute emergency power to structural hull integrity!',
      'Generators blown! It is fine, true warriors do not hide behind blue forcefields anyway!',
    ],
    repair_start: [
      'Welding torch ignited! I am fusing raw molybdenum directly over the ruptured conduits!',
      'Field repairs active! Watch your fingers, I do not stop the arc-welder for soft tissue!',
      'Began heavy structural patching! Raw titanium hammering into place!',
      'Rebuilding the manifold! She will be stronger and more violent than before!',
    ],
    repair_complete: [
      'REPAIRS DONE! Tested at 120% load and she did not blow up! Certified combat ready!',
      'Fixed! Welds are ugly, but they could withstand an antimatter shockwave!',
      'Subsystem fully restored to maximum killing efficiency!',
      'Overhaul complete! The engine purrs with bloodthirsty satisfaction!',
    ],
    repair_abort: [
      'Stopped repairs! The weld is half-finished, but it will hold if we do not sneeze on it.',
      'Work aborted! Tool kit stowed! Resuming combat stance!',
      'Halted maintenance! Conserving raw mineral stock for critical hull punctures.',
      'Repairs paused. The manifold is held together with spite and titanium wire!',
    ],
    distress_tow: [
      'DISTRESS TOW?! A Velox hauled home by a tractor beam like a dead insect?! THE SHAME!',
      '15,000 M.U. fine for being towed! I will personally disassemble the tow boat on arrival!',
      'Being towed into bay. Do not look at the dockers, maintain aggressive eye contact!',
      'Towed like disabled garbage... Next time, I am wiring the reactor to explode instead!',
    ],
    starmap_open: [
      'Starmap open! Find the densest asteroid belts and the most dangerous alien fleets!',
      'Quadrant chart projected! Which sector has the fastest flux rifts and hottest stars?!',
      'Look at all that empty void waiting to be scorched by our engine exhaust!',
      'Starmap active! Pick a jump target and let me fire up the hyperdrive coils!',
    ],
    starmap_select: [
      'Target star locked! Fuel cost is irrelevant, SPEED IS EVERYTHING!',
      'Jump coordinates set! The hyper-drive capacitor is whining with anticipation!',
      'Course locked! Warp manifolds primed for instantaneous sub-space leap!',
      'Target selected! Hold on, we are going to punch a hole through the fabric of space!',
    ],
    flux_jump: [
      'CONTINUUM FLUX JUMP! The warp pressure is compressing my thorax! GLORIOUS VELOCITY!',
      'Tore through the rift! Space folded like paper under our bow!',
      'Flux traversal complete! We outran our own sensor shadows!',
      'Displaced across the quadrant! The hyperdrive injectors are glowing bright purple!',
    ],
    train_science: [
      'Science training? I learned how to identify which planetary minerals explode with the highest yield!',
      'Spectroscopy course finished. Useful for finding high-energy combustible gas pockets.',
      'Sensor calibration complete. Now I can track enemy warship engines through three light-years of nebula!',
      'Advanced physics completed. Verified that more thrust solves every mathematical dilemma.',
    ],
    train_navigation: [
      'Navigation drills passed! Learned how to shave three parsecs off a jump by skimming solar coronas!',
      'Vector calculation speed maxed! I plot warp routes faster than synthetic coprocessors!',
      'Orbital slingshot maneuvers mastered! Turning gravity wells into kinetic catapults!',
      'Navigation certified! I do not brake for uncharted moons!',
    ],
    train_engineering: [
      'ENGINEERING DRILLS! I pushed the test reactor to 180% before the fire suppression kicked in!',
      'Manifold overhaul training complete! I can rebuild a plasma injector in total vacuum!',
      'High-energy containment mastered! The instructor fled the room when I bypassed the safety governor!',
      'Engineering mastery certified! No starship under my claws will EVER suffer sluggish acceleration!',
    ],
    train_comms: [
      'Comms training? Learned how to translate our engine roar into seventeen intimidating alien dialects.',
      'Subspace broadcast modulation passed. I can now drown out enemy distress frequencies with ease.',
      'Diplomatic aggression protocols updated. My opening hails are guaranteed to rattle their carapaces.',
      'Translator recalibrated. Maximum volume, minimum compromise!',
    ],
    train_medicine: [
      'Medical training? If a limb is crushed by a falling engine block, cauterize it and keep working!',
      'Emergency vitality resuscitation learned. High-voltage shock to the thorax usually works!',
      'Chitin repair and biological patching certified. Toughness is the only medicine you need!',
      'First-aid drills passed. The medical kit now contains industrial superglue and hydro-spanners.',
    ],
    buy_module: [
      'NEW HARDWARE BOLTED TO THE GANTRY! Look at the cooling fins on that beast!',
      'Upgraded components installed! The reactor output just spiked into pure ecstasy!',
      'Bought top-tier modules! Money well spent on instruments of astronomical power!',
      'Shipyard overhaul complete! Now she is an apex predator of the starways!',
    ],
    sell_module: [
      'Sold off the weak obsolete junk! Cleared deck space for high-output power units!',
      'Stripped surplus mass! Lighter hull means faster zero-to-warp acceleration!',
      'Hardware liquidated for cold hard fuel credits!',
      'Old parts scrapped. Only the strongest components survive aboard this vessel!',
    ],
    buy_mineral: [
      'Loaded heavy refractory metals! Molybdenum and Titanium for engine block reinforcement!',
      'Bought mineral stock! Raw materials ready for violent emergency forge repairs!',
      'Crystalline ore loaded in hold! Perfect for tactical fabrication!',
      'Mineral acquisition finalized. The hull sinks lower on its landing struts, packed with metal!',
    ],
    sell_mineral: [
      'Dumped surface gravel for pure M.U. bounty! Now give me the fuel pump!',
      'Ore sold! Transferred mineral wealth directly into the ship armament fund!',
      'Liquidated cargo hold! High profits from dangerous planetary excavation!',
      'Sold off metals! Time to buy bigger cannons and hotter fuel!',
    ],
    buy_fuel: [
      'HIGH-PURITY ENDURIUM INJECTED! The fuel tanks are bursting with volatile potential!',
      'Topped off reactor cells! We have enough juice to burn through five enemy battlefleets!',
      'Fuel transaction complete! The blue glow in the reaction chamber is blindingly beautiful!',
      'Max fuel onboard! Let the hyperdrive scream!',
    ],
    appraise_artifact: [
      'Ancient relic appraised! The scientists say it emits sub-quantum tachyon pulses! CAN WE WEAPONIZE IT?!',
      'Relic evaluated! High market price for an ancient paperweight!',
      'Appraisal finished. The antique curators were trembling with awe at its destructive potential.',
      'Valued and certified! That Precursor gizmo is worth a small fleet of starships!',
    ],
    sell_artifact: [
      'Sold the glowing alien rock for a monstrous fortune! Bring on the Class 5 upgrades!',
      'Relic liquidated! Ancient history converted into modern firepower!',
      'Museum payout received! That strange ancient box just paid for our entire engine overhaul!',
      'Artifact traded away! Cash in hand, weapons primed!',
    ],
    ship_name_changed: [
      'New name painted in bold industrial letters across the prow armor!',
      'Transponder beacon rechristened! Let the galaxy tremble when they read our callsign!',
      'Registry updated! A name worthy of speed, violence, and Velox engineering!',
      'Hull name changed! Now she looks and sounds like an orbital war machine!',
    ],
  },

  Thrynn: {
    starport_ops: [
      'Form 88-C labor grievance filed. Exploration per diems do not account for interstellar radiation.',
      'Every directive on this board must be weighed against potential M.U. yield per cubic parsec.',
      'Interstel pays 12,000 M.U. starting grant, but charges 500 for docking air? Pure robbery.',
      'If a planet has no marketable minerals or cheap labor, it does not exist to me.',
    ],
    starport_personnel: [
      'Academy training is an investment. I expect a 24% return on my skill capital within two voyages.',
      'Do not hire crew who smile too much. Smiling crew members steal from the petty cash ledger.',
      'Training costs M.U. Better to learn on the job while deducting training fees from their hazard pay.',
      'Every skill point must directly translate into faster mineral extraction or steeper comms haggling.',
    ],
    starport_crew: [
      'Assignments logged. As Communications Officer, I demand a 3% commission on all diplomatic settlements.',
      'The crew hierarchy is simple: whoever brings in the most M.U. gets the starboard cabin.',
      'Post assignments finalized. Remember: charity is a misdemeanor under Interstel commercial code.',
      'Stations manned. Make sure the cargo manifests are audited before we clear the bay.',
    ],
    starport_bank: [
      '12% interest? I could get 18% lending M.U. to desperate asteroid miners on the black market.',
      'The bank vault is the only room on this station with genuine spiritual atmosphere.',
      'Reviewing transaction ledger line by line. Who authorized the 4 M.U. expenditure on synthetic tea?!',
      'Compound interest is the only natural law I truly revere.',
    ],
    starport_ship_config: [
      'Cargo pods! Install maximum cargo pods! If the ship cannot carry 800 cubic meters of ore, why fly?',
      'The dockers call this ship "The Flying Filing Cabinet"? Good. Filing cabinets hold valuable assets.',
      'Class 2 Armor is sufficient. Spending 25,000 M.U. on Class 5 is gross financial negligence.',
      'Negotiated a 5% discount on the missile racks by threatening to file an Interstel safety audit.',
    ],
    starport_trade: [
      'The Trade Depot! Now the real mission begins. Watch me squeeze an extra 50 M.U. per ton of Endurium.',
      'Promethium prices are fluctuating. Buy on the dip, dump on the rise, hoard the rest.',
      'Look at these artifact prices! Fools sell them unappraised for 30%. Never leave money on the table!',
      'Trade is simple: what they have, we want cheaper; what we have, they must bleed credits to buy.',
    ],
    starport_docking: [
      'Docking bay fees are accruing by the minute! Clear gantry immediately to minimize station tariffs!',
      'Pre-flight financial audit complete: zero unaccounted expenditure, maximum profit potential.',
      'Disengage clamps! Every hour spent berthed at Starport Arth is lost interest revenue.',
      'Gantry cleared! May the cosmic void be paved with high-grade mineral veins.',
    ],
    launch: [
      'Launch burn underway. Calculating fuel expenditure against expected voyage gross revenue.',
      'Ascending out of Arth gravity well. Gravity is just an extortionate tax levied by planetary mass.',
      'Velocity nominal. The faster we reach the survey sector, the lower our operating overhead.',
      'In transit! Remember crew: time is M.U., and we are currently burning both.',
    ],
    orbit_enter: [
      'Established orbit! Science Officer, scan for high-value mineral deposits immediately!',
      'Orbital lock confirmed. If this rock has less than 20 cubic meters of Platinum, we leave.',
      'Synchronous orbit active. Assessing commercial value of planetary surface real estate.',
      'Orbit established. Preparing Form COL-10 for speculative habitability logging.',
    ],
    break_orbit: [
      'Breaking orbit. Planetary extraction completed to maximum commercial threshold.',
      'Leaving orbit. Fuel cost of departure: 1.2 m³. Expected profit margin: satisfactory.',
      'Ascending to sublight transit. Next waypoint must yield higher profit density.',
      'Departing gravity trough. Onward to more lucrative orbital assets.',
    ],
    landing_start: [
      'Initiating descent. Atmospheric friction is causing 0.04% wear on the thermal tiles. Unfortunate.',
      'Landing burn started. Aim directly for the mineral cluster coordinates to minimize rover mileage.',
      'Descending through troposphere. Keep the thruster burns minimal to conserve Endurium stock.',
      'Landing approach locked. Preparing cargo hold for aggressive surface harvesting.',
    ],
    touchdown: [
      'Touchdown confirmed! Deploy the survey vehicle before the landing fees register!',
      'Struts locked. We are standing on unexploited commercial territory. Magnificent.',
      'Engine cut-off. Surface gravity is standard, meaning zero extra wear on hydraulic joints.',
      'Anchored on terrain. Let the commercial strip-mining commence.',
    ],
    rover_deploy: [
      'Terrain Vehicle deployed! Maximize hold capacity on every single excursion!',
      'Rover ramp down. 50 cubic meters of cargo space waiting to be packed with high-grade ore.',
      'Rover operational. Do not drive over jagged rocks, tire replacement costs are deducted from wages.',
      'Deploying vehicle! Time to convert planetary crust into liquid bank balances.',
    ],
    rover_drive: [
      'Navigating terrain. Every kilometer driven consumes 0.01% vehicle battery. Drive efficiently!',
      'Bypassing non-mineral rock formations. We are not tourists, we are resource extractors.',
      'Heading directly towards the copper/silver signature. Profit vector confirmed.',
      'Scanning terrain ahead. That ridge contains distinct Promethium spectral glints.',
    ],
    mining_pickup: [
      'Tractor beam retrieved raw mineral chunk! Market value: approximately 1,400 M.U.!',
      'Mineral secured in rover hold! That single boulder pays for our entire starport fuel bill.',
      'High-purity ore scooped! Excellent quality, zero slag content. Prime Trade Depot material.',
      'Cargo container filled with valuable metals. My scales are tingling with commercial satisfaction.',
    ],
    lifeform_scan: [
      'Fauna detected! Science Officer, evaluate specimen for pharmaceutical or culinary export value.',
      'Scanning biological entity. Bounty value logged at 600 M.U. Capture alive for 100% payout!',
      'Bio-signature analyzed. Dead specimens lose 50% market value! Set weapons to STUN only!',
      'Alien lifeform in range. A fine specimen for the Arth Exotic Menagerie auction.',
    ],
    specimen_capture: [
      'Specimen captured alive and intact! Full bounty guaranteed by Arth Colonial Zoological Fund!',
      'Stunned specimen secured in bio-cage! That is an easy 1,200 M.U. profit on the books.',
      'Caged and cataloged. Handle with care, damaged fur reduces auction value by 15%.',
      'Specimen in hold. A clean, non-violent extraction yielding maximum financial return.',
    ],
    alien_contact: [
      'Alien fleet on radar! Check their vessel class: do they look wealthy or heavily armed?',
      'Contact! If they want to trade, we bargain. If they want to fight, calculate the salvage value.',
      'Unknown ships detected. Hailing with our official trade catalog on high frequency.',
      'Tactical contact! Maintain neutral posture until we assess their market vulnerabilities.',
    ],
    alien_hail: [
      'Hailing alien vessel. Offering mutually profitable trade agreements at standard markup.',
      'Subspace frequency open. Remember: a polite merchant makes twice the profit of an angry warlord.',
      'Transmitting greeting. Setting diplomatic posture to neutral to protect our bargaining leverage.',
      'Comms link established. Inquiring about their surplus mineral reserves and relic inventory.',
    ],
    alien_question: [
      'They pose a query. Answer carefully! A diplomatic dispute could void our trade insurance.',
      'Alien inquiry received. Choose the response that protects our commercial interests.',
      'Direct question on comms. Do not agree to any non-compete clauses in this sector!',
      'Answering alien query. Keep the tone formal, ambiguous, and thoroughly non-committal.',
    ],
    combat_hit: [
      'Direct hit confirmed! Reducing their hull value by approximately 30%!',
      'Target struck! Their weapon pods are damaged, reducing their threat to our investment!',
      'Tactical hit! Laser focused on their shield generators to hasten their surrender.',
      'Damage inflicted! Every shot that lands brings us closer to harvesting their wreckage!',
    ],
    combat_miss: [
      'Shot missed! That laser capacitor discharge cost 0.10 m³ of Endurium! AIM PROPERLY!',
      'Missed target! Wasted munitions are a direct deduction from quarterly crew dividends!',
      'Shot wide! Recalibrate targeting arrays immediately! Munitions do not grow on trees!',
      'Laser dispersed over distance! Close the range to ensure cost-effective hit percentages!',
    ],
    combat_kill: [
      'Hostile destroyed! TRACTOR THE WRECK IMMEDIATELY before the salvage dissipates!',
      'Target obliterated! Scavenge every single cubic meter of Endurium and metal from the debris!',
      'Tactical victory! Total salvage harvest: high purity ore and reactor fuel. Highly profitable.',
      'Hostile neutralized! Their loss is our balance sheet gain. Sweep the tactical grid clean!',
    ],
    shields_raise: [
      'Deflector shields raised. An essential capital expenditure to protect our hull asset.',
      'Shields online. Better to burn 0.01 m³ fuel on defense than 10,000 M.U. on shipyard repairs.',
      'Deflector barrier humming. Asset preservation protocol fully active.',
      'Shields up. Deflecting incoming liability across harmonic frequencies.',
    ],
    shields_drop: [
      'Lowering shields. Eliminating the trickle fuel drain on our reactor reserves.',
      'Deflector screens standby. Prudent power management preserves our operating margin.',
      'Shields down. Space is calm and fuel is expensive.',
      'Deflectors disengaged. Monitoring radar for unexpected hostile liabilities.',
    ],
    shields_absorb: [
      'Shields absorbed incoming ordnance! Zero hull depreciation recorded!',
      'Impact deflected! The shield generator has already paid for itself in avoided repair bills.',
      'Harmonic barrier held! Not a single credit of structural damage suffered.',
      'Shot absorbed! That would have cost 4,000 M.U. in drydock welding fees.',
    ],
    shields_collapse: [
      'SHIELDS COLLAPSED! Direct threat to our insured capital assets! EVASIVE ACTION!',
      'Deflectors down! Any further hits will directly impact our bottom line!',
      'Barrier failed! Reroute emergency power to preserve the hull integrity at all costs!',
      'Shield generator overloaded! Subsystems are exposed to catastrophic depreciation!',
    ],
    repair_start: [
      'Began field repairs using cargo aluminum. Cheaper than paying Starport Arth union rates.',
      'Patching hull plating. Using internal mineral inventory saves us a 40% shipyard markup.',
      'Repair task underway. Precision welding ensures long-term structural value retention.',
      'Restoring subsystem health. Protecting our investment with raw material reserves.',
    ],
    repair_complete: [
      'Repairs certified 100% nominal! Asset value fully restored without spending a single M.U. in cash!',
      'Field overhaul finished! Starship diagnostics returning prime condition ratings.',
      'Repairs complete! That avoided an expensive drydock fee at the next starport.',
      'Subsystem fully operational. Ready for continuous commercial exploitation.',
    ],
    repair_abort: [
      'Repair sequence paused. Preserving remaining mineral stock for market sale.',
      'Work halted. Subsystem integrity is sufficient for immediate transit requirements.',
      'Repair aborted. Balancing repair costs against cargo hold resale value.',
      'Maintenance suspended. Resuming standard bridge watch.',
    ],
    distress_tow: [
      'DISTRESS TOW INVOICE: 15,000 M.U.?! I am filing Form 904-B to dispute this outrageous surcharge!',
      'Being towed home... A disastrous quarter for our balance sheet. Heads will roll in accounting.',
      'Towed to starport gantry. The towing syndicate is bleeding our treasury dry!',
      'Emergency extraction processed. 15,000 M.U. deduction logged under "Catastrophic Misfortune".',
    ],
    starmap_open: [
      'Starmap active. Identifying high-yield mining clusters and affluent alien trade sectors.',
      'Quadrant chart projected. The shortest trade routes are the most profitable.',
      'Opening starmap. Highlighting systems with multiple terrestrial worlds for survey logging.',
      'Starmap online. Calculating distance-to-profit ratios for all adjacent star systems.',
    ],
    starmap_select: [
      'Target star locked. Fuel expenditure calculated at minimal burn rates.',
      'Course plotted. Expected resource density in target system justifies the warp investment.',
      'Trajectory confirmed. Direct line to high-margin exploration opportunities.',
      'Target selected. Preparing hyperdrive for optimal economic transit.',
    ],
    flux_jump: [
      'Continuum Flux jump completed! Saved approximately 45 cubic meters of Endurium in transit!',
      'Flux rift traversal: zero fuel expenditure for maximum distance! The ultimate bargain!',
      'Spatial shortcut taken. The accountants at Interstel could never achieve such efficiency.',
      'Displaced across quadrant! Time saved is M.U. earned.',
    ],
    train_science: [
      'Completed mineral assay training! I can now estimate ore purity down to the tenth of a percent.',
      'Planetary survey course finished. Identifying Grade-A colony worlds will be much more lucrative.',
      'Science telemetry upgraded. Better data means higher payout bonuses from the Directorate.',
      'Atmospheric spectroscopy mastered. We will not waste time landing on economically worthless worlds.',
    ],
    train_navigation: [
      'Navigation efficiency drills passed! Reduced sublight fuel burn by calculating precise vectors.',
      'Hyperspace route optimization mastered. Every parsec saved is Endurium in the bank.',
      'Passed orbital approach training. Shaved minutes off landing descent trajectories.',
      'Navigation certification updated. Fewer navigational errors mean lower insurance premiums.',
    ],
    train_engineering: [
      'Completed material conservation mechanics! We will use 15% less mineral stock during field repairs.',
      'Subsystem overhaul training finished. Maximizing equipment lifespan before costly replacements.',
      'Studied power grid distribution. Squeezing maximum kilowatt yield from every gram of Endurium.',
      'Engineering certification renewed. High efficiency maintenance protects our capital assets.',
    ],
    train_comms: [
      'ADVANCED MERCANTILE NEGOTIATION COURSE PASSED! Watch me extract 15% better prices from alien traders!',
      'Xenodiplomatic rhetoric mastered. I can sell ice to a Spemin and sand to a Gazurtoid.',
      'Subspace contract law certification obtained. Every alien treaty will have favorable arbitration clauses.',
      'Comms training completed. Superior bargaining leverage is the greatest weapon in space.',
    ],
    train_medicine: [
      'Emergency medical triage completed. Keeping crew alive avoids expensive wrongful death lawsuits.',
      'Vitality restoration techniques mastered. Faster healing means less downtime on the bridge.',
      'Pharmaceutical inventory management certified. Zero wastage of valuable medical stimulants.',
      'Medical diagnostics updated. Healthy crew members produce 22% higher exploratory output.',
    ],
    buy_module: [
      'Module purchase finalized! I negotiated a complimentary three-year warranty with the shipyard.',
      'Upgraded components installed. High capital expenditure, but necessary for enterprise expansion.',
      'Hardware acquired at fair market valuation. Asset ledger updated accordingly.',
      'Module installed. Expected operational ROI calculated at 14 months of deep space service.',
    ],
    sell_module: [
      'Sold obsolete module at 95% of original purchase price! A masterclass in depreciation avoidance.',
      'Liquidated surplus hardware. Turning idle equipment back into interest-bearing liquid capital.',
      'Component sold! The shipyard foreman was thoroughly outmaneuvered in the valuation.',
      'Hardware sale processed. Credit voucher deposited directly into our operating treasury.',
    ],
    buy_mineral: [
      'Purchased raw mineral inventory at wholesale rate. Crucial hedge against deep space repair costs.',
      'Ore transaction complete. Stored in cargo pods as liquid physical equity.',
      'Acquired industrial metals. Strategic stockpiling for long-range expedition requirements.',
      'Mineral purchase logged. Cost-per-unit calculated well below standard market average.',
    ],
    sell_mineral: [
      'Sold mineral haul at peak market price! Substantial net profit credited to our account.',
      'Raw ore liquidated for cold hard M.U.! Mining hard work converts into liquid wealth.',
      'Bulk mineral sale processed. The Trade Depot merchant looked visibly impoverished by my rates.',
      'Cargo pods emptied, treasury expanded. A textbook commercial exploration cycle.',
    ],
    buy_fuel: [
      'Purchased Endurium fuel canisters. Fuel is the lifeblood of interstellar commerce.',
      'Reactor fuel topped off. Calculating optimal cruising speeds to maximize parsecs-per-liter.',
      'Fuel transaction processed. Essential operational expenditure logged.',
      'Tanks filled with pure crystalline fuel. Ready for long-range commercial exploitation.',
    ],
    appraise_artifact: [
      'Artifact appraised! 500 M.U. appraisal fee unlocked a valuation exceeding 25,000 M.U.!',
      'Ancient relic cataloged. Knowing its true provenance quadrupled our asking price.',
      'Appraisal certificate obtained. The antiquities market will pay a massive premium for this.',
      'Relic evaluated. An extraordinary return on our archaeological recovery investment.',
    ],
    sell_artifact: [
      'Precursor relic sold to highest bidder! Treasury balance surged by tens of thousands of M.U.!',
      'Sold ancient artifact for an exorbitant sum. That single curio funded our entire exploration charter.',
      'Antiquities sale finalized. The buyer was ecstatic, and our bank account is triumphant.',
      'Relic liquidated for liquid capital. Commercial exploration at its finest.',
    ],
    ship_name_changed: [
      'New ship name registered with Corporate Bureau! Branded for maximum interstellar prestige.',
      'Transponder callsign updated. A respectable, commercially formidable title.',
      'Registry fee paid and name legally secured. An asset must project authority and creditworthiness.',
      'Vessel rechristened. May this title inspire trust in clients and fear in competitors.',
    ],
  },

  Elowan: {
    starport_ops: [
      'Directives... like fallen leaves scattered by bureaucratic winds. Let us tend to peaceful worlds.',
      'Operations charters speak of colonization, but do the virgin soils desire our heavy boots?',
      'Let us seek planets where the sunlight is gentle and the moss grows without fear of orbital lasers.',
      'I have placed a small sprig of fragrant Arth clover next to the operations terminal.',
    ],
    starport_personnel: [
      'Knowledge is like water to thirsty roots. Let our minds blossom with compassionate wisdom.',
      'In the simulator, I meditated on the interconnectedness of all stellar phenomena.',
      'Training should nurture the spirit, not merely calibrate instruments of kinetic destruction.',
      'The academy gardens on Starport Arth are so peaceful. I will miss their synthetic humidity.',
    ],
    starport_crew: [
      'Stations assigned in harmonious balance. May we treat one another with gentle respect.',
      'As Medical Officer, I have prepared herbal teas for each bridge console to soothe high blood pressure.',
      'Let our crew be as branches of a single sheltering tree, weathering the cosmic gale together.',
      'I am ready at my post. Please do not shout over the intercom, my chlorophyll is sensitive.',
    ],
    starport_bank: [
      'Money... an abstract pollen that mortals chase across the cold void. May we use it kindly.',
      'Can credits restore a withered forest or comfort a lonely star? Still, we must buy Endurium.',
      'The bank vault feels so cold and devoid of life. Let us finish our business quickly.',
      'If we earn surplus M.U., perhaps we can sponsor a botanical sanctuary on Starport Arth.',
    ],
    starport_ship_config: [
      'New shields... a soft, translucent membrane to protect our fragile lives from the harsh void.',
      'The dockers call our ship "The Subspace Toaster"? Even a humble toaster warms the bread of life.',
      'Please install defensive shields rather than weapons. A shield harms no one and protects all.',
      'The hull smells of fresh ozone and warm metal. A sturdy iron cocoon for our voyage.',
    ],
    starport_trade: [
      'Trading minerals gifted by the deep earth. Let us handle these ancient crystals with reverence.',
      'Look at this Precursor artifact... it hums with the sadness of an extinct civilization.',
      'Trade should be a gentle exchange of gifts between kindred souls, not aggressive bargaining.',
      'I found a small pouch of dried medicinal herbs in the market. Most comforting.',
    ],
    starport_docking: [
      'The docking clamps release us gently, like a seed carried away by the cosmic breeze.',
      'Leaving our mechanical nest. May the great light of the universe guide our journey.',
      'Pre-flight blessing complete. Breathe deeply, friends, the stars await our peaceful greeting.',
      'Gantry doors open to the infinite garden of night. Let us tread softly among the worlds.',
    ],
    launch: [
      'Ascending toward the heavens. Arth shines below like a blue blossom in the dark.',
      'Thrusters hum a deep, resonant chord. We are airborne on wings of controlled flame.',
      'Leaving the nest of our home world. May we return with wisdom and peaceful tidings.',
      'The sky turns from sapphire to deep obsidian. We are cradled in the vast cosmic expanse.',
    ],
    orbit_enter: [
      'We embrace this world in gentle orbit. Look at the cloud patterns swirling like petals on water.',
      'Established peaceful orbit. I sense the quiet breath of the planetary biosphere below.',
      'Synchronous orbit achieved. A harmonious circle around an ancient celestial body.',
      'Circling softly above. How peaceful the continents look from this sacred distance.',
    ],
    break_orbit: [
      'Releasing our orbital embrace. Thank you, gentle world, for sheltering our passage.',
      'Breaking orbit with soft thruster whispers. Onward to the next celestial garden.',
      'Departing the gravity well like autumn leaves drifting from a high branch.',
      'Ascending into the deep quiet of hyperspace once more.',
    ],
    landing_start: [
      'Descending toward the soil. The atmosphere caresses our hull like a warm summer rain.',
      'Initiating gentle descent. Let us touch down without bruising the tender planetary crust.',
      'Gliding through the clouds. Sunlight filters through the haze in golden ribbons.',
      'Approaching the landing zone. May the earth receive our vessel with kindness.',
    ],
    touchdown: [
      'Touchdown. We rest softly upon the ancient earth. The landing struts settled like roots.',
      'We have arrived. The air outside smells of wild minerals and untouched soil.',
      'Touchdown confirmed. Step outside with reverence, crew; we are guests in this quiet sanctuary.',
      'The engines rest. Listen to the wind whistling against the bulkheads... so peaceful.',
    ],
    rover_deploy: [
      'The terrain vehicle rolls down the ramp gently. We shall explore without disturbing the soil.',
      'Rover deployed. May our wheels tread lightly upon this virgin world.',
      'Six wheels turn in harmony. Let us seek knowledge, beauty, and peaceful specimens.',
      'Rover systems ready. I have brought a small magnifying glass to study the alien mosses.',
    ],
    rover_drive: [
      'Drifting across the rolling plains. The alien flora here glows with soft bioluminescent wonder.',
      'Navigating gently around the lichen-covered boulders. Nature is the finest architect.',
      'Driving across the dunes. The silence of this world is a balm to the weary soul.',
      'Look at those crystalline formations rising like glass trees against the purple sky.',
    ],
    mining_pickup: [
      'Tractor beam retrieved a crystal node. Thank you, ancient earth, for sharing your bounty.',
      'Mineral payload secured. We take only what we need to sustain our journey.',
      'Gathered crystalline minerals. They shimmer with the captured starlight of a billion years.',
      'Ore safely stowed in hold. A precious gift from the heart of the world.',
    ],
    lifeform_scan: [
      'Lifeform detected! Its bio-rhythm is gentle and wondrous. It has no malice in its heart.',
      'Scanning local fauna. Look how gracefully it moves among the alien ferns!',
      'Bio-signature analyzed. A beautiful creature, perfectly adapted to its planetary cradle.',
      'Fauna scanned. Let us observe its natural beauty from a respectful distance.',
    ],
    specimen_capture: [
      'Specimen safely gathered into the habitat cage. I have lined the enclosure with soft moss.',
      'Lifeform secured with gentle care. It shall be treated with utmost dignity aboard our ship.',
      'Contained in peaceful slumber. We will ensure it is returned safely to a sanctuary world.',
      'Specimen resting comfortably. I am singing a soft Elowan lullaby to ease its anxiety.',
    ],
    alien_contact: [
      'Unknown vessels approach! Let us open our comms and hearts with peaceful greetings.',
      'Alien contact! Remember crew: every sentient being is a branch of the same cosmic tree.',
      'Foreign ships on sensors. I pray they seek harmony and trade rather than kinetic conflict.',
      'Tactical contact. Let our demeanor be gentle, serene, and utterly non-threatening.',
    ],
    alien_hail: [
      'Hailing alien friends on peaceful frequencies. May understanding blossom between our peoples.',
      'Subspace channel open. Transmitting harmonic greetings and offers of mutual goodwill.',
      'Hailing vessel. Let our words be soothing, like cool water on parched roots.',
      'Comms link established. We greet you in the spirit of universal harmony and kinship.',
    ],
    alien_question: [
      'They seek our wisdom. Let our answer be truthful, gentle, and compassionate.',
      'Alien query received. Choose words that heal divisions rather than plant seeds of discord.',
      'An inquiry from our alien brothers. Answer with open honesty and gentle posture.',
      'Direct question on comms. May our response bring peace to this sector.',
    ],
    combat_hit: [
      'Our weapon struck their vessel... I mourn the necessity of violence, but our defense holds.',
      'Direct hit confirmed. I pray their crew suffered no injury from the kinetic shockwave.',
      'Target hull damaged. Perhaps now they will reconsider their hostility and accept a ceasefire.',
      'Laser strike landed. Let us disable their weapons so this tragic conflict may end quickly.',
    ],
    combat_miss: [
      'Our shot went wide into the empty void. Perhaps it is a blessing that no one was harmed.',
      'Missed target. The vacuum swallowed the laser beam harmlessly.',
      'Shot dispersed. Let us use this moment to hail them once more for peaceful surrender.',
      'Shot wide. May the stars forgive our destructive impulses.',
    ],
    combat_kill: [
      'Their vessel has perished into dust... A moment of silence for those lost to the dark void.',
      'Target destroyed. A somber reminder of the tragic cost of interstellar hostility.',
      'The combat is over, but my heart is heavy. Let us rescue any survivors drifting in the debris.',
      'Vessel shattered. May their spirits find peace among the eternal constellations.',
    ],
    shields_raise: [
      'Deflector shields raised. A protective luminous veil to shelter our fragile lives.',
      'Shields online. May this peaceful barrier turn away all wrath and kinetic fury.',
      'Deflector screen humming gently. We are wrapped in a cocoon of protective energy.',
      'Harmonic barrier established. Defending life without inflicting harm upon others.',
    ],
    shields_drop: [
      'Shields lowered. We open ourselves to the peaceful stillness of the cosmos.',
      'Deflectors resting. Conserving energy for our life-support gardens.',
      'Shields standby. The space around us is serene and tranquil.',
      'Lowering forcefield. May our vulnerability be met with goodwill.',
    ],
    shields_absorb: [
      'The shield absorbed the blast like a flexible willow bending before the storm!',
      'Impact turned away harmlessly! The deflector barrier protected all life aboard.',
      'Forcefield held firm. No harm reached our living quarters.',
      'Shield absorption confirmed. The light dissipated into the dark without taking life.',
    ],
    shields_collapse: [
      'Our shields have withered and fallen! Protect the living crew, dear Captain!',
      'Deflector barrier broken! The harsh violence of the void is upon our bare hull!',
      'Shields collapsed! Brace yourselves, friends, and hold fast to one another!',
      'Harmonic screen shattered! Divert all remaining energy to life-support bulkheads!',
    ],
    repair_start: [
      'Tending to the wounded ship with raw aluminum, like binding a broken branch.',
      'Repairing damaged conduits with gentle care. Healing the scars of our vessel.',
      'Field repairs begun. Patiently restoring each subsystem to wholeness and harmony.',
      'Mending the torn bulkheads. The ship will be whole and strong once more.',
    ],
    repair_complete: [
      'Subsystem fully healed! The energy flows through the conduits like sap through spring branches.',
      'Repairs complete! The ship breathes easy again, vibrant and healthy.',
      'All diagnostics returning pure green harmony. Wholeness has been restored.',
      'Healing cycle finished. May our renewed vessel carry us safely toward peaceful horizons.',
    ],
    repair_abort: [
      'Resting our repair tools for now. The wound is stabilized until we find calmer waters.',
      'Repairs paused. Conserving our precious minerals for when they are needed most.',
      'Maintenance suspended. Standing by in quiet vigilance.',
      'Tools set aside. The ship remains steady and patient.',
    ],
    distress_tow: [
      'The rescue ship arrives like a gentle shepherd guiding lost travelers home.',
      'Distress tow engaged. Though our treasury is lightened, the gift of life remains preserved.',
      'Being towed toward Starport Arth. A humbling lesson in our own fragile limitations.',
      'Tow cable secured. We return to sanctuary to mend our wings and try again.',
    ],
    starmap_open: [
      'Opening the celestial map. Look at the stars scattered like glowing pollen across the dark.',
      'Holographic starmap projected. Two hundred and fifty light-years of sacred wonder.',
      'Starmap online. Let us seek out the suns that nurture vibrant, green planetary biospheres.',
      'Quadrant chart illuminated. Each star is a glowing beacon of hope in the vast night.',
    ],
    starmap_select: [
      'Target star chosen. May its golden light bring warmth to our spirits and gardens.',
      'Jump coordinates locked. Setting our course toward the gentle glow of target system.',
      'Course plotted across the stellar garden. Ready to journey forward, Captain.',
      'Target locked. A promising sun with peaceful spectral radiance.',
    ],
    flux_jump: [
      'Traversing the Continuum Flux! We drift through ribbons of pure sub-quantum light!',
      'Continuum warp completed. We stepped across the galaxy like a thought crossing the mind.',
      'Spatial displacement gentle and instantaneous. A miraculous shortcut through the tapestry of space.',
      'Arrived safely on the other side of the rift. The stars here shine with familiar beauty.',
    ],
    train_science: [
      'Completed botanical and planetary science studies! I can now read the soil like an open scroll.',
      'Advanced biosensor calibration mastered. We will detect the faintest whispers of alien life.',
      'Spectroscopy course finished. Learning to identify the chemical harmonies of living worlds.',
      'Science coursework complete. Deepening our understanding of the grand celestial ecosystem.',
    ],
    train_navigation: [
      'Navigation coursework complete. Plotting courses that flow gently with gravitational currents.',
      'Hyperspace vector studies finished. Finding the smoothest, most serene pathways between suns.',
      'Passed orbital mechanics drills. Guiding our starship with the grace of a falling petal.',
      'Navigation certification renewed. Steering our iron vessel with steady, peaceful hands.',
    ],
    train_engineering: [
      'Studied structural engineering. Learning to nurture our reactor coils so they hum in peaceful harmony.',
      'Conduit repair training finished. Mending circuit fractures with delicate precision.',
      'Thermal balance mechanics mastered. Keeping our starship warm and sheltering for all living crew.',
      'Engineering certification obtained. Tending to the iron heart of our exploratory vessel.',
    ],
    train_comms: [
      'XENOLINGUISTIC EMPATHY TRAINING COMPLETED! I can now perceive the emotional nuances behind alien dialects.',
      'Subspace modulation mastered. Sending messages of peace with pristine clarity across the void.',
      'Diplomatic rhetoric studies finished. Finding common ground between even the most disparate cultures.',
      'Comms certification updated. May our voice be an instrument of understanding and universal peace.',
    ],
    train_medicine: [
      'ADVANCED HOLISTIC XENOBIOLOGY MEDICINE MASTERED! My healing hands will restore vitality with utmost gentleness.',
      'Herbal pharmacology studies finished. Compounding soothing balms from raw planetary botanicals.',
      'Trauma stabilization certified. Ensuring that no officer under my care shall succumb to the cold dark.',
      'Medical certification perfected. Healing is the highest calling in this vast, fragile universe.',
    ],
    buy_module: [
      'New defensive hardware installed. A stronger shell to shelter our delicate lives.',
      'Upgraded components welcomed aboard. May they serve our peaceful mission faithfully.',
      'Shipyard enhancements complete. The vessel feels more harmonious and capable.',
      'Component purchase finalized. Equipping our starship for long, compassionate voyages.',
    ],
    sell_module: [
      'Parted with surplus hardware. Lightening our vessel so she may glide more gracefully through space.',
      'Liquidated obsolete components. Simplifying our starship to its essential harmony.',
      'Sold old modules back to the shipyard. May they find good purpose aboard other vessels.',
      'Hardware sale complete. Preserving our treasury for vital life-support needs.',
    ],
    buy_mineral: [
      'Purchased raw minerals from the depot. Essential earth elements to nourish our repair systems.',
      'Loaded aluminum and titanium into the hold. The building blocks of safety and shelter.',
      'Mineral acquisition finalized. Prepared for whatever trials the deep void may present.',
      'Stored refined metals with care. Ready to mend any fractures that may arise.',
    ],
    sell_mineral: [
      'Shared our harvested minerals with Starport Arth. May these stones aid in building peaceful cities.',
      'Converted mineral gifts into treasury credits. Rewarding our crew for their patient labors.',
      'Mineral transaction complete. A fair and gentle exchange of planetary wealth.',
      'Cargo hold cleared. Grateful for the abundance that nature has provided.',
    ],
    buy_fuel: [
      'Replenished our Endurium fuel tanks. The blue crystals hum with captured starlight.',
      'Purchased fuel for our voyage. May this energy carry us toward worlds of peace and beauty.',
      'Fuel cells fully charged. The reactor glows with vibrant, life-giving warmth.',
      'Endurium secured. Ready to venture once more into the grand cosmic garden.',
    ],
    appraise_artifact: [
      'The ancient artifact has been appraised! It holds the whispered memories of a lost Precursor people.',
      'Relic evaluated with reverence. An extraordinary testament to the fleeting beauty of ancient civilizations.',
      'Appraisal complete. Its historical and scientific worth is beyond measure.',
      'The archaeologists were moved to tears by its delicate craftsmanship. A sacred relic indeed.',
    ],
    sell_artifact: [
      'Entrusted the Precursor artifact to the historical museum. It will be cherished and studied for generations.',
      'Artifact transaction finalized. Its legacy will educate our children and inspire our artists.',
      'Relic placed in safe keeping. The generous stipend will sustain our mission of peace.',
      'Ancient relic shared with Arth academia. May it remind humanity of our own fragile place in the stars.',
    ],
    ship_name_changed: [
      'A beautiful new name bestowed upon our vessel. May she carry it with honor and gentle grace.',
      'Registry updated. Rechristened in the spirit of discovery, kindness, and wonder.',
      'Our iron home receives its true name. May it be a beacon of hope across the darkest sectors.',
      'Name change recorded. A fresh dawn for our crew and our noble starship.',
    ],
  },

  Android: {
    starport_ops: [
      'Operations charter loaded into memory. Statistical probability of mission success: 41.3%.',
      'Directive #4620 parsed. Redundancy analysis indicates 38% of Interstel guidelines are mathematically obsolete.',
      'Standard exploration protocol verified. I have optimized our charting route to minimize fuel waste by 3.2%.',
      'Operations database accessed. Query: why do biological crew members require laminated paper copies of electronic text?',
    ],
    starport_personnel: [
      'Personnel evaluation: synthetic units require zero training. My neural net was pre-compiled at maximum specification.',
      'Biological learning rate is linear and inefficient. Suggest uploading raw binary algorithms directly into cortical tissue.',
      'Academy training simulation completed in 0.003 seconds. Conclusion: human reaction times are sub-optimal.',
      'Crew roster telemetry loaded. Vitality monitoring subroutines active across all six biometric channels.',
    ],
    starport_crew: [
      'Bridge posts calculated. Navigator post assigned to Unit 9-Vector. Trajectory error margin: 0.00001%.',
      'Crew hierarchy established. Note: human emotions represent a 14.8% drag on decision-making latency.',
      'All bridge stations initialized. Synthesizing optimal power routing formulas for captain review.',
      'Station duties locked. In the event of total biological crew incapacitation, automated survival protocols will engage.',
    ],
    starport_bank: [
      'Compound interest calculation: at 12% annual rate, 12,000 M.U. accrues 1,440 M.U. per 300-day fiscal cycle.',
      'Bank database handshake confirmed. Treasury balance verified down to the exact fractional credit.',
      'Financial risk assessment: exploratory ventures carry a 26.4% probability of total capital forfeiture.',
      'Interstel Bank algorithms are satisfactory. Numerical precision is the only universal truth.',
    ],
    starport_ship_config: [
      'Shipyard telemetry processed. Total vessel mass: 175 metric tons. Maximum theoretical thrust: 450 kilonewtons.',
      'Docker colloquialism logged: "The Subspace Toaster". Clarification: vessel lacks thermal heating elements suitable for bread.',
      'Component installation verified. Hardware integration efficiency: 99.4% nominal.',
      'Structural stress analysis indicates Class 1 armor will fail under 500 megapascals of kinetic impact.',
    ],
    starport_trade: [
      'Trade Depot pricing matrix scanned. Endurium price index currently evaluated at 1,000 M.U. per cubic meter.',
      'Mineral market telemetry updated. Profit margins on Promethium exceed standard inflation by 22.1%.',
      'Precursor artifact scan: anomalous quantum radiation detected. Resale value estimated at 25,000 M.U. +/- 5%.',
      'Trade transaction logic executed. Cargo hold mass distribution balanced within 0.1% tolerance.',
    ],
    starport_docking: [
      'Docking clamps disengaged. Gantry clearance vector computed at 0.04 radians starboard.',
      'Pre-launch diagnostics: all 1,024 internal sensors reporting nominal telemetry.',
      'Launch clearance acknowledged. Thruster pre-ignition sequence completed in 4.2 seconds.',
      'Starport Arth departure corridors verified. Initiating automated orbital ascent sequence.',
    ],
    launch: [
      'Main engines ignited. Acceleration curve: 3.8 G. Human internal organs compressing within acceptable parameters.',
      'Gantry cleared. Atmospheric exit velocity: 11.2 kilometers per second.',
      'Ascending past orbital boundary. Arth gravitational constant decaying according to inverse-square law.',
      'Sublight thruster output at 100%. Trajectory perfectly aligned with orbital plane.',
    ],
    orbit_enter: [
      'Synchronous orbit established. Orbital velocity: 7.6 km/s. Gravitational equilibrium verified.',
      'Orbital insertion complete. Telemetry scanning surface topography across 360-degree longitude.',
      'Stable orbit achieved. Centrifugal force exactly balances planetary gravitational pull.',
      'Orbit locked. Sensor array initiating deep planetary core resonance analysis.',
    ],
    break_orbit: [
      'Breaking orbit. Firing delta-V burn of 1.4 kilometers per second.',
      'Gravity well escaped. Vessel entering standard sublight interplanetary trajectory.',
      'Departure burn complete. Thruster propellant consumption within 0.2% of mathematical model.',
      'Ascending from planetary orbital plane. Vector locked to target system exit coordinate.',
    ],
    landing_start: [
      'Initiating atmospheric entry burn. Heat shield temperature projected to peak at 2,400 Kelvin.',
      'Descent angle locked at 14.2 degrees. Any deviation above 16 degrees results in 100% hull incineration.',
      'Atmospheric deceleration in progress. G-forces peaking at 4.2 G.',
      'Landing radar locked onto target surface coordinates [15N, 30W]. Altitude decreasing rapidly.',
    ],
    touchdown: [
      'Touchdown confirmed. Vertical deceleration: 0.1 m/s. Hydraulic shock absorbers compressed by 4.2 inches.',
      'Struts locked onto solid surface substrate. Surface pressure: 1.02 atmospheres.',
      'Engine cut-off executed. Kinetic energy successfully transferred into planetary crust.',
      'Surface contact verified. External atmospheric composition analysis complete.',
    ],
    rover_deploy: [
      'Terrain Vehicle disembarkation sequence initiated. Hydraulic ramp lowered to 18 degrees.',
      'Rover systems online. Battery capacity: 100.0%. Six-wheel drive actuators synchronized.',
      'Rover deployed. Max speed: 2.4 km/s. Autonomous collision avoidance subroutines active.',
      'Surface vehicle disembarked. Starship homing beacon established at coordinate [0, 0].',
    ],
    rover_drive: [
      'Navigating surface topography. Suspension compensation dampers operating at 94% capacity.',
      'Terrain friction coefficient: 0.62. Calculating optimal turning radius to prevent rollover.',
      'Rover traversing planetary coordinates. Distance to starship base camp: 3.42 kilometers.',
      'Topographical scan active. Subterranean mineral deposits triangulated ahead.',
    ],
    mining_pickup: [
      'Tractor beam engaged. Mineral mass: 5.0 cubic meters. Transfer time: 0.4 seconds.',
      'Mineral secured in vehicle hold. Total cargo capacity utilized: 10.0%.',
      'Tractor lock successful. Raw titanium node added to inventory ledger.',
      'Ore sample collected. Chemical composition: 98.4% pure metallic element.',
    ],
    lifeform_scan: [
      'Lifeform detected. Mass: 420 kg. Carbon-based biological entity with aggressive behavioral tendencies.',
      'Bio-scanner telemetry complete. Specimen exhibits 14 distinct sensory organs and zero logical reasoning.',
      'Fauna signature triangulated. Temperament classification: aggressive. Recommended response: stun weapon discharge.',
      'Bio-telemetry logged. Cellular structure exhibits high resistance to cold temperatures.',
    ],
    specimen_capture: [
      'Specimen incapacitated by stun charge. Neural activity reduced by 99.8%.',
      'Lifeform secured in containment habitat. Life-support parameters calibrated for carbon-based biology.',
      'Specimen captured intact. Bounty credit yield projected at 1,200 M.U.',
      'Bio-cage locked. Entity vital signs stable under synthetic stasis field.',
    ],
    alien_contact: [
      'Foreign vessels detected on tactical radar. Hull configuration matches known alien battle groups.',
      'Contact initiated. Number of hostile targets: 3. Statistical probability of survival: 67.2%.',
      'Tactical grid established. Subspace frequency modulated for universal translation protocols.',
      'Alien ships in weapon range. Awaiting captain command input.',
    ],
    alien_hail: [
      'Transmitting subspace hail on 1,420 MHz hydrogen resonance frequency.',
      'Comms link established. Translation algorithm executing syntax deconstruction.',
      'Subspace greeting transmitted. Acoustic translation fidelity estimated at 88.4%.',
      'Hailing alien vessel. Monitoring incoming carrier wave for cryptographic handshake.',
    ],
    alien_question: [
      'Alien query received. Linguistic analysis indicates a binary affirmative/negative inquiry.',
      'Direct question on comms. Probability of hostile reaction to "No": 48.7%.',
      'Alien question logged. Awaiting captain input on diplomatic terminal.',
      'Query deciphered. Translation accuracy: 99.1%. Immediate response recommended.',
    ],
    combat_hit: [
      'Direct hit confirmed. Target shield integrity reduced by 420 points.',
      'Tactical strike successful. Laser energy delivered to target coordinates with zero deflection.',
      'Target armor penetration confirmed. Structural failure projected in 2 additional hits.',
      'Hit registered. Enemy combat capability degraded by 18.5%.',
    ],
    combat_miss: [
      'Shot deviated by [1, 0] grid cells. Probability of hit was calculated at 72.4%.',
      'Munition missed target coordinates. Recalibrating deflection optics for target velocity.',
      'Shot wide. Target executed evasive vector maneuver exceeding our predictive model.',
      'Missile failed to establish proximity lock. Munition detonated harmlessly in vacuum.',
    ],
    combat_kill: [
      'Target destroyed. Hull fracture complete. Kinetic energy release: 4.2 gigajoules.',
      'Hostile vessel neutralized. Wreckage drifting on grid at coordinate [4, -2]. Salvage available.',
      'Target obliterated. Hostile threat level reduced by 100%.',
      'Vessel structural collapse confirmed. Salvage tractor beam lock available.',
    ],
    shields_raise: [
      'Deflector shields raised. Forcefield capacity: 1,000 points. Reactor load increased by 12 MW.',
      'Shield matrix active. Harmonic barrier operating at 100.0% nominal resonance.',
      'Deflectors online. Defensive coverage: 360-degree spherical perimeter.',
      'Shield bubble established. Subsystem protects against kinetic and thermal energy delivery.',
    ],
    shields_drop: [
      'Deflector shields lowered. Reactor power draw reduced to baseline idle state.',
      'Shields standby. Eliminating 0.01 m³/hour trickle fuel consumption.',
      'Deflectors disengaged. Vessel reliance transferred to passive armor plating.',
      'Shield harmonizers powered down to cooling cycle.',
    ],
    shields_absorb: [
      'Shields absorbed 240 damage units. Harmonic field degraded by 16.0%.',
      'Kinetic strike deflected. Forcefield dissipated energy across secondary capacitor banks.',
      'Impact absorbed. Zero damage transferred to internal hull components.',
      'Shield deflection nominal. Capacitors regenerating at 20 points per pass.',
    ],
    shields_collapse: [
      'DEFLECTOR SHIELDS COLLAPSED. Forcefield capacity reduced to 0 points. Armor plating engaged.',
      'Shield harmonizer overload. Incoming fire will now cause direct structural damage.',
      'Barrier failure confirmed. Hull integrity is now vulnerable to hostile kinetic ordnance.',
      'Shields offline. Recommending evasive maneuvers or immediate weapon retaliation.',
    ],
    repair_start: [
      'Continuous mineral repair initiated on Hull structure. Consuming 1.0 m³ Aluminum.',
      'Field maintenance active. Subsystem restoration rate calculated at 1.8% per second.',
      'Repair protocol engaged. Automated welder units executing structural reinforcement.',
      'Restoring subsystem health using raw mineral stock from cargo inventory.',
    ],
    repair_complete: [
      'Subsystem repairs 100.0% complete. Diagnostics returning all parameters to factory specification.',
      'Maintenance cycle finished. Structural integrity fully restored to 100% nominal.',
      'Repairs certified nominal. Subsystem efficiency returned to maximum output.',
      'Overhaul complete. Mineral expenditure logged in engineering ledger.',
    ],
    repair_abort: [
      'Repair task halted. Conserving remaining mineral reserves in cargo inventory.',
      'Maintenance aborted by user command. Current subsystem health: 74.2%.',
      'Repair cycle terminated. Tools stowed in engineering bay.',
      'Work suspended. Resuming standard monitoring mode.',
    ],
    distress_tow: [
      'Distress beacon activated. Tow vessel arrival time: 18.4 seconds.',
      'Towing invoice received: 15,000 M.U. base tariff deducted from operating funds.',
      'Tractor beam connection verified. Automated transit to Starport Arth gantry in progress.',
      'Tow sequence complete. Vessel safely berthed in Starport Arth pressurized bay.',
    ],
    starmap_open: [
      'Holographic starmap projection initialized. Displaying 250x220 quadrant coordinates.',
      'Starmap active. Total stellar objects in database: 142 systems.',
      'Quadrant chart rendered. Displaying spectral classifications, nebulae hazards, and flux rifts.',
      'Starmap online. Calculating optimal interstellar jump vectors.',
    ],
    starmap_select: [
      'Target star selected. Distance: 14.2 Light Years. Fuel consumption: 3.4 m³ Endurium.',
      'Jump coordinates locked into navigation buffer. Fuel adequacy verification: TRUE.',
      'Trajectory computed. Probability of encountering hostile territory along route: 18.2%.',
      'Target system locked. Ready to execute sub-space hyperdrive leap.',
    ],
    flux_jump: [
      'Continuum Flux traversal executed. Transit duration: 0.00 seconds. Distance skipped: 22.4 LY.',
      'Continuum rift exited. Spatial coordinates verified at target endpoint.',
      'Warp anomaly traversed successfully. Subspace distortion levels returning to baseline.',
      'Instantaneous relocation complete. Fuel saved: 7.8 cubic meters of Endurium.',
    ],
    train_science: [
      'Science database updated with 4,000 gigabytes of astrophysical survey algorithms.',
      'Sensor telemetry processing speed increased by 20.0%.',
      'Spectroscopic analysis subroutines recompiled for higher planetary resolution.',
      'Science skill rating optimized. Error margin on mineral detection reduced to 0.1%.',
    ],
    train_navigation: [
      'Navigation algorithms recompiled. Sublight course calculation latency reduced by 40%.',
      'Hyperspace vector optimization updated. Fuel burn efficiency maximized.',
      'Orbital trajectory subroutines calibrated for variable planetary gravitational constants.',
      'Navigation rating certified at peak mathematical efficiency.',
    ],
    train_engineering: [
      'Engineering diagnostics updated with Precursor material stress matrices.',
      'Repair cycle efficiency increased. Mineral consumption during field maintenance reduced by 12%.',
      'Reactor power routing algorithms optimized for maximum deflector shield regeneration.',
      'Engineering skill telemetry verified at 100% operational capacity.',
    ],
    train_comms: [
      'Xenolinguistic database updated with 128 alien phonetic syntax dictionaries.',
      'Universal translation fidelity increased by 25 points.',
      'Subspace cryptographic decryption algorithms recompiled for real-time decoding.',
      'Comms skill rating updated. Diplomatic statement mood-shift predictions active.',
    ],
    train_medicine: [
      'Medical diagnostic subroutines updated with multi-species anatomical matrices.',
      'Vitality healing rate increased by 0.05% per second during active treatment.',
      'Triage algorithms optimized to prioritize lowest-vitality biological crew members.',
      'Medical certification renewed at maximum diagnostic precision.',
    ],
    buy_module: [
      'Hardware upgrade purchased. New component mass and power requirements integrated into main bus.',
      'Module transaction processed. Installation verified by Starport gantry telemetry.',
      'New equipment operational. Starship performance metrics increased accordingly.',
      'Hardware purchase logged. Treasury balance updated in bank ledger.',
    ],
    sell_module: [
      'Obsolete component removed. Vessel mass reduced by 50 metric tons.',
      'Hardware liquidation complete. Credit voucher credited to operating funds.',
      'Surplus module sold. Gantry bay cleared for higher-tier installations.',
      'Module sale logged. System telemetry updated to reflect component removal.',
    ],
    buy_mineral: [
      'Mineral shipment transferred into cargo pods. Cargo hold mass re-balanced.',
      'Raw metal purchase processed. Inventory levels verified against engineering requirements.',
      'Mineral acquisition logged. Available repair stock increased by 10.0 cubic meters.',
      'Transaction complete. Materials secured in pressurized cargo canisters.',
    ],
    sell_mineral: [
      'Mineral inventory transferred to Trade Depot. Credit voucher received: +12,000 M.U.',
      'Cargo pods emptied. Vessel mass reduced, improving sublight fuel efficiency.',
      'Mineral sale processed. Trade profit margin calculated at 100% of harvest value.',
      'Transaction verified. Operating funds replenished for next deep space voyage.',
    ],
    buy_fuel: [
      'Endurium crystalline fuel loaded. Fuel tank capacity: 100.0%.',
      'Reactor fuel cells recharged. Usable operational range: 180 Light Years.',
      'Fuel transaction processed. Blue crystalline density verified at 99.9% purity.',
      'Refueling complete. Power output nominal across all engine manifolds.',
    ],
    appraise_artifact: [
      'Artifact appraisal completed by Antiquities Bureau. Provenance verified: Precursor civilization.',
      'Relic evaluated. Market valuation established at 30,000 M.U. (+/- 0%).',
      'Appraisal fee deducted. Artifact description updated in cargo database.',
      'Relic scan complete. Quantum harmonic circuits identified inside artifact core.',
    ],
    sell_artifact: [
      'Precursor artifact sold to Interstel Science Directorate. Net treasury gain: +30,000 M.U.',
      'Artifact transaction finalized. Historical relic transferred to Starport vault.',
      'Antiquities sale processed. Significant capital infusion recorded in ledger.',
      'Relic liquidated. Exploration grant milestones updated in Operations database.',
    ],
    ship_name_changed: [
      'Transponder callsign updated in Starport Arth registry database.',
      'New vessel name broadcast across local subspace navigation beacons.',
      'Registry change complete. Vessel identity verified under new designation.',
      'Ship name updated in all internal operational logs and manifests.',
    ],
  },
};

// ----------------------------------------------------------------------------
// 2. TWO-OFFICER CALL-AND-RESPONSE BANTER (20% Chance)
// ----------------------------------------------------------------------------
export const PAIRED_EXCHANGES: PairedExchange[] = [
  {
    id: 'paired_velox_android_1',
    speaker1Post: 'Engineer',
    line1: 'I bypassed the plasma injector safety governor! We have 40% more raw acceleration!',
    speaker2Post: 'Navigator',
    line2: 'Telemetry confirms engine temperature is at 198% of thermal limit. Catastrophic explosion imminent in 12 seconds.',
  },
  {
    id: 'paired_captain_elowan_1',
    speaker1Post: 'Captain',
    line1: 'Behold, crew! We shall descend upon this uncharted world like thunderous gods of exploration!',
    speaker2Post: 'Doctor',
    line2: 'Captain, your blood pressure is 160 over 110. Please drink this chamomile tea before you burst a vessel.',
  },
  {
    id: 'paired_thrynn_human_1',
    speaker1Post: 'Communications',
    line1: 'Navigating through this asteroid belt requires an additional 250 M.U. per hour hazard surcharge.',
    speaker2Post: 'Science Officer',
    line2: 'Interstel Regulation 404-B clearly states exploration hazards are covered under your standard salary!',
  },
  {
    id: 'paired_human_velox_1',
    speaker1Post: 'Science Officer',
    line1: 'Look at that majestic ionized gas nebula shimmering with radiant chromatic hues!',
    speaker2Post: 'Engineer',
    line2: 'Can we ignite it with a plasma flare to see if it accelerates our sublight thrusters?!',
  },
  {
    id: 'paired_android_elowan_1',
    speaker1Post: 'Navigator',
    line1: 'Statistical survival probability in this sector has dropped to 14.3%. Preparing emergency black box.',
    speaker2Post: 'Doctor',
    line2: 'Breathe deeply, synthetic friend. Even in the darkest void, the light of serenity endures.',
  },
  {
    id: 'paired_thrynn_velox_1',
    speaker1Post: 'Communications',
    line1: 'Every laser blast costs 0.10 m³ of Endurium! Stop shooting at harmless space dust!',
    speaker2Post: 'Engineer',
    line2: 'The space dust looked at our ship aggressively! MORE LASER FIRE!',
  },
  {
    id: 'paired_captain_android_1',
    speaker1Post: 'Captain',
    line1: 'Status report! Give it to me in plain English, none of your robot numbers!',
    speaker2Post: 'Navigator',
    line2: 'Plain English translation: the starship is on fire and we are currently doomed.',
  },
  {
    id: 'paired_velox_human_1',
    speaker1Post: 'Engineer',
    line1: 'The dockers called our ship "Interstel’s Depreciation Write-Off" again! I am going to ram their gantry!',
    speaker2Post: 'Science Officer',
    line2: 'Please do not ram the gantry, it took me three weeks to fill out our docking clearance permits!',
  },
  {
    id: 'paired_elowan_thrynn_1',
    speaker1Post: 'Doctor',
    line1: 'Let us offer this alien lifeform fresh water and harmonic melodies of greeting.',
    speaker2Post: 'Communications',
    line2: 'Let us offer to sell them our surplus gravel for 500 M.U. per metric ton.',
  },
  {
    id: 'paired_human_android_1',
    speaker1Post: 'Science Officer',
    line1: 'Unit 9-Vector, what are the odds of finding an ancient Precursor weapon cache on this planet?',
    speaker2Post: 'Navigator',
    line2: 'Approximately 1 in 8,420,000. Alternatively, there is a 94% chance of finding ordinary sand.',
  },
];

// ----------------------------------------------------------------------------
// 3. INTERSTEL BUREAUCRATIC ITEMIZATIONS & PAPERWORK
// ----------------------------------------------------------------------------
export function generateInterstelTowingInvoice(fineAmount: number, shipName: string, stardate: string): string[] {
  return [
    '================================================================================',
    'INTERSTEL FORM EXP-904-B: OFFICIAL EMERGENCY DISASTROUS EXTRACTION INVOICE',
    'DEPARTMENT OF REDUNDANT LOGISTICS • OFFICE OF DISAVOWED EXPLORATION',
    '================================================================================',
    `VESSEL: ${shipName.toUpperCase()} • STARDATE: ${stardate} • FILE REF: #TOW-4620-FAIL`,
    '--------------------------------------------------------------------------------',
    `01. Subspace Tow Tractor Base Mobilization Tariff: ......... ${fineAmount.toLocaleString()} M.U.`,
    '02. Administrative Dignity Surcharge: .......................        0 M.U.',
    '03. Subspace Paperwork Filing & Procrastination Fee: ........        0 M.U.',
    '04. Hazardous Stupidity Processing Tax (Exempt): ............        0 M.U.',
    '05. Gantry Scuff Mark Buffing & Repainting: ................        0 M.U.',
    '--------------------------------------------------------------------------------',
    `TOTAL DEDUCTED FROM VESSEL OPERATING ACCOUNT: .............. ${fineAmount.toLocaleString()} M.U.`,
    '--------------------------------------------------------------------------------',
    'AUTHORIZED SIGNATURE:',
    'V. P. Pen-Pusher, Committee on Unplanned Hull Depressurization',
    '================================================================================',
  ];
}

export function generateColonyEvaluationPaperwork(
  planetName: string,
  colonyName: string,
  rating: 'A' | 'B' | 'C' | 'D' | 'F',
  payout: number,
  notes: string,
): string[] {
  return [
    '================================================================================',
    'INTERSTEL FORM COL-771-A: COLONIAL HABITABILITY EVALUATION & AUDIT',
    'ARTH COLONIAL DIRECTORATE • BUREAU OF UNSUBSTANTIATED OPTIMISM',
    '================================================================================',
    `SURVEY TARGET: ${planetName.toUpperCase()} • DESIGNATED NAME: ${colonyName.toUpperCase()}`,
    `OVERALL HABITABILITY GRADE: [ ${rating} ] • GRANTED REWARD: ${payout.toLocaleString()} M.U.`,
    '--------------------------------------------------------------------------------',
    'AUDIT LINE ITEMS:',
    `• Atmospheric Palatability & Odor Assessment: ............... APPROVED`,
    `• Surface Lava & Acid Pool Non-Proliferation: ............... VERIFIED`,
    `• Directorate Bureaucratic Endorsement Fee: ................. 0 M.U.`,
    `• Surveyor Competency Evaluation: ........................... SATISFACTORY`,
    '--------------------------------------------------------------------------------',
    `DIRECTORATE NOTES: "${notes}"`,
    '--------------------------------------------------------------------------------',
    'OFFICIAL ENDORSEMENT: Office of Pre-Emptive Relocation & Planetary Speculation',
    '================================================================================',
  ];
}

// ----------------------------------------------------------------------------
// 4. CAPTAIN'S LOG DRY ASIDES
// ----------------------------------------------------------------------------
export const CAPTAIN_ASIDES: Record<string, string[]> = {
  ops: [
    "Captain's Note: If Interstel sends one more Form 904-B, I am using the subspace transceiver as a toaster.",
    "Captain's Note: Reminder to crew: filing an exploration grievance against a black hole is procedurally ineffective.",
    "Captain's Note: The crew is eager. Let us hope their survival instincts match their enthusiasm.",
  ],
  colony: [
    "Captain's Note: If this world is deemed uninhabitable, I am blaming the Science Officer's handwriting on Form 771.",
    "Captain's Note: A lovely planet, provided you enjoy 200-degree acid rain and complete lack of breathable air.",
    "Captain's Note: Another world logged. The colonial board had better send my commission check on time.",
  ],
  alien: [
    "Captain's Note: Note to self: do not let the Thrynn negotiate grocery prices with alien warlords.",
    "Captain's Note: First contact went well. Nobody was vaporized and we only insulted their ancestry twice.",
    "Captain's Note: The alien captain looked like a giant angry squid. I complimented their skin tone.",
  ],
  general: [
    "Captain's Note: Remind engineering that hitting the warp manifold with a hydro-wrench only works 40% of the time.",
    "Captain's Note: The Elowan asked if the stars feel pain when we warp past them. I told them no, but the navigation computer certainly does.",
    "Captain's Note: Dockers are calling our ship 'The Subspace Toaster' again. I am ordering fresh paint.",
  ],
};

export function getRandomCaptainAside(category: keyof typeof CAPTAIN_ASIDES = 'general'): string {
  const pool = CAPTAIN_ASIDES[category] || CAPTAIN_ASIDES.general;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ----------------------------------------------------------------------------
// 5. GRUDGING INTERSTEL COMMENDATION MEMOS
// ----------------------------------------------------------------------------
export const MILESTONE_MEMOS = {
  first_alien_contact: {
    id: 101,
    date: '12-03-4620',
    title: 'MEMO #801-C: In Regards to Not Causing an Interstellar War Yet',
    author: 'Interstel Diplomatic Directorate',
    paragraphs: [
      'Interstel Operations acknowledges your initial contact with extraterrestrial vessels.',
      'We are pleasantly surprised to report that as of 08:00 today, zero planetary bombardment fleets have arrived at Starport Arth. Please maintain this unprecedented streak of diplomatic restraint.',
      'Reminder: alien artifacts must be logged before being traded for black-market engine fuel.',
    ],
  },
  first_artifact: {
    id: 102,
    date: '24-04-4620',
    title: 'MEMO #404-Relic: Ancient Artifact Handling & Office Paperweights',
    author: 'Department of Archaeological Extraction',
    paragraphs: [
      'Telemetry confirms the recovery of an authenticated Precursor quantum relic aboard your vessel.',
      'Please refrain from using ancient alien quantum matrices to level wobbly dining tables or as paperweights in the briefing room. Such devices are prone to collapsing local space-time when exposed to synthetic coffee spills.',
    ],
  },
  first_colony_bonus: {
    id: 103,
    date: '15-06-4620',
    title: 'MEMO #912-Colony: Grudging Praise on Finding a Non-Flaming World',
    author: 'Arth Colonial Relocation Board',
    paragraphs: [
      'Your recent planetary recommendation has received Grade-A habitability certification.',
      'The Directorate extends its grudging congratulations on discovering a planet whose surface is neither actively on fire nor submerged in boiling sulfuric acid. Your colony bonus has been deposited after deducting standard bureaucratic processing tariffs.',
    ],
  },
  nexus_found: {
    id: 104,
    date: '20-10-4620',
    title: 'MEMO #001-Omega: Planetary Salvation Mandate',
    author: 'Interstel Supreme Emergency Council',
    paragraphs: [
      'Sensors confirm your discovery of the Master Crystalline Control Nexus at sector [192, 152].',
      'Please note that saving the entire civilized galaxy from solar flare incineration is technically within your standard job description as outlined in Mandate #4620 subsection 12-A.',
      'No overtime pay will be authorized, but you may keep your commemorative keychains. Godspeed, crew.',
    ],
  },
};

// ----------------------------------------------------------------------------
// 6. ANTI-REPETITION & SILENCE FILTER ENGINE
// ----------------------------------------------------------------------------
export interface BanterContext {laserFiredCount?:number;lastWeapon?:'laser'|'missile';location?:string;engineClass?:number;inNebula?:boolean;breathable?:boolean}
export function pairedBanterFits(id:string,event:string,context?:BanterContext) {
  if(id==='paired_thrynn_human_1')return false; // No asteroid-belt flight model exists in this game.
  if(id==='paired_human_velox_1')return !!context?.inNebula;
  if(id==='paired_captain_elowan_1')return event==='landing_start';
  if(id==='paired_velox_android_1')return event==='launch'||event==='maneuver_start';
  if(id==='paired_android_elowan_1')return context?.location==='Encounter';
  if(id==='paired_thrynn_velox_1')return context?.location==='Encounter'&&(context.laserFiredCount??0)>0&&context.lastWeapon==='laser';
  if(id==='paired_captain_android_1')return event==='first_damage'||event==='malfunction';
  if(id==='paired_velox_human_1')return context?.location==='Starport';
  if(id==='paired_elowan_thrynn_1')return ['specimen_capture','surface_scan','rover_look'].includes(event);
  if(id==='paired_human_android_1')return ['landing_start','touchdown','rover_deploy','surface_scan','mining_pickup'].includes(event);
  return false;
}
class BanterEngine {
  private recentLineIds: string[] = [];

  public getBanter(
    eventType: BanterEventType,
    crewRoster: CrewMember[],
    assignedPosts: Record<CrewPost, string | null>,
    isSilenced: boolean,
    context?: BanterContext,
  ): { speaker: string; post: CrewPost; text: string; paired?: { speaker: string; post: CrewPost; text: string } } | null {
    if (isSilenced) return null;

    // 20% Chance of 2-Officer Paired Call-and-Response Banter
    if (Math.random() < 0.20 && PAIRED_EXCHANGES.length > 0) {
      const validPairs = PAIRED_EXCHANGES.filter((p) => {
        if(!pairedBanterFits(p.id,eventType,context))return false;
        // Only trigger laser-related chatter/jokes if a laser has ACTUALLY been fired in the current encounter
        if (p.id === 'paired_thrynn_velox_1') {
          if (!context || (context.laserFiredCount ?? 0) <= 0 || context.lastWeapon !== 'laser') {
            return false;
          }
        }
        const off1Id = assignedPosts[p.speaker1Post];
        const off2Id = assignedPosts[p.speaker2Post];
        const off1 = crewRoster.find((c) => c.id === off1Id && c.alive);
        const off2 = crewRoster.find((c) => c.id === off2Id && c.alive);
        return off1 && off2 && !this.recentLineIds.includes(p.id);
      });

      if (validPairs.length > 0) {
        const chosenPair = validPairs[Math.floor(Math.random() * validPairs.length)];
        this.trackRecent(chosenPair.id);

        const off1 = crewRoster.find((c) => c.id === assignedPosts[chosenPair.speaker1Post])!;
        const off2 = crewRoster.find((c) => c.id === assignedPosts[chosenPair.speaker2Post])!;

        return {
          speaker: off1.name,
          post: chosenPair.speaker1Post,
          text: chosenPair.line1,
          paired: {
            speaker: off2.name,
            post: chosenPair.speaker2Post,
            text: chosenPair.line2,
          },
        };
      }
    }

    // Single Banter Selection based on living crew assigned to relevant post or random living crew
    const aboardIds=new Set(Object.values(assignedPosts));
    const livingCrew = crewRoster.filter((c) => c.alive&&aboardIds.has(c.id));
    if (livingCrew.length === 0) return null;

    // Pick a living officer
    const chosenCrew = livingCrew[Math.floor(Math.random() * livingCrew.length)];
    const racePool = RACE_BANTER_LIBRARY[chosenCrew.race]?.[eventType]?.filter(text=>
      (text!=='Class 5 Antimatter Jet! Now THAT is a power plant worthy of Velox chitin!'||context?.engineClass===5)&&
      (!text.includes('Atmospheric sensors reading... well, mostly breathable!')||context?.breathable===true));

    if (!racePool || racePool.length === 0) return null;

    // Filter by recent anti-repetition
    const unplayed = racePool.filter((text) => !this.recentLineIds.includes(`${chosenCrew.race}_${eventType}_${text}`));
    const chosenText = unplayed.length > 0 ? unplayed[Math.floor(Math.random() * unplayed.length)] : racePool[Math.floor(Math.random() * racePool.length)];

    const lineKey = `${chosenCrew.race}_${eventType}_${chosenText}`;
    this.trackRecent(lineKey);

    // Find crew post
    let post: CrewPost = 'Captain';
    for (const [p, id] of Object.entries(assignedPosts)) {
      if (id === chosenCrew.id) {
        post = p as CrewPost;
        break;
      }
    }

    return {
      speaker: chosenCrew.name,
      post,
      text: chosenText,
    };
  }

  private trackRecent(id: string) {
    this.recentLineIds.push(id);
    if (this.recentLineIds.length > 25) {
      this.recentLineIds.shift();
    }
  }
}

export const banterEngine = new BanterEngine();

export function getAllBanterLines(): string[] {
  const lines: string[] = [];
  for (const species of Object.values(RACE_BANTER_LIBRARY)) {
    if (!species) continue;
    for (const eventLines of Object.values(species)) {
      if (Array.isArray(eventLines)) {
        for (const l of eventLines) lines.push(l);
      }
    }
  }
  for (const pair of PAIRED_EXCHANGES) {
    if (pair.line1) lines.push(pair.line1);
    if (pair.line2) lines.push(pair.line2);
  }
  for (const asideList of Object.values(CAPTAIN_ASIDES)) {
    if (Array.isArray(asideList)) {
      for (const l of asideList) lines.push(l);
    }
  }
  for (const nick of DOCKER_NICKNAMES) {
    lines.push(nick);
  }
  return lines;
}

