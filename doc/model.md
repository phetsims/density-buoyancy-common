# Model for Density and Buoyancy

Documented by @AgustinVallejo with support from @samreid and @zepumph

This document is a high-level description of the model used in the following PhET’s suite of simulations: _Density_, _Buoyancy_ and _Buoyancy: Basics_. These simulations address concepts related to buoyant forces, floatability, and their relationship with densities, different materials, and Archimedes principle of displaced liquid.

The physics are generally handled using the following types of forces:

* Gravity: A constant acceleration downward. For this simulation, it's 9.8m/s
  
* Buoyancy: A force based on the different pressures on the top/bottom of masses. For this simulation, it's only upward, and is equal to the weight of the displaced fluid.
  
* Contact: Masses can push into each other or the ground. The ground is immovable. No restitution.
  
* Friction: Only horizontal friction is handled in this simulation
  
* Viscosity: A custom function determining a viscous force is applied, so that oscillations stabilize at a proper rate.
  

Despite all the forces listed above, no rotation or torque is considered in these simulations, which can lead to unrealistic scenarios, which have no negative impact on the learning goals of the sim.

Additionally:

* Internally, the p2.js physics library is used, read _implementation-notes.md_ for further information.
  
* Velocity is limited to 5m/s.
  
* There are invisible walls and an invisible ceiling that keep masses within the workable area.
  
* The liquid level always stays flat, that is, fluid "instantly" moves out of the way.
  
* Air is ignored (buoyancy acts like there is a vacuum, and there is no air friction).
  

## Density

For this simulation, all the masses are cubes. The following is a brief description of each screen:

* Intro Screen: Allows you to explore different materials and see how they interact with a fluid, typically water. Each material has a fixed density, so adjusting the mass will change the volume accordingly, and vice versa. There is also a Custom material option for independent adjustment of mass and volume. The density of each material is displayed, and you can observe whether the material floats or sinks based on its density compared to the fluid.
  
* Compare Screen: Lets you analyze different blocks by comparing their mass, volume, and density. You can select blocks to have the same mass, volume, or density using the options on the right. Adjust the mass slider to see how different materials with the same mass interact with the fluid and observe their floating or sinking behavior. This screen helps illustrate the relationship between mass, volume, and density across various materials.
  
* Mystery Screen: This screen challenges you to identify unknown materials by comparing their behaviors to known densities. You can select different sets of mystery blocks or randomize them using the options on the right. A Density Table in the center displays the densities of various materials for reference. By observing how the mystery blocks interact with the fluid, you can infer their densities and match them to the materials listed in the table. This screen helps you apply your understanding of density to solve practical identification problems.
  

## Buoyancy

Like Density but now with the option to change the pool’s fluid. Buoyancy also has readouts the density of the blocks, the percentage of the block submerged, and lets you visualize the forces acting on the blocks, including gravity, buoyancy, and contact forces. Also, there’s a pool scale which let’s you take weight measurements and slightly change how submerged the object is, via a slider.

* Compare Screen: Allows you to investigate how different blocks with the same mass, volume, or density interact with a fluid. You can adjust the mass of the blocks using the slider on the right and observe their behavior in the fluid.
  
* Explore Screen: Gets you to investigate the effects of varying mass, volume, and fluid density on an object's buoyancy. You can select different materials, adjust their mass and volume using the sliders, and observe how they interact with the fluid.
  
* Lab Screen: You can adjust the fluid density and gravity, providing insights into how these variables affect buoyant forces. This screen introduces the "Fluid Displaced" visualization, showing the volume and weight of the fluid displaced by the object, enhancing understanding of Archimedes' principle.
  
* Shapes Screen: You can select from various shapes, including blocks, ellipsoids, vertical and horizontal cylinders, cones, inverted cones, and a duck. Adjust the height and width of the shapes to see how these dimensions impact their volume and interaction with the fluid. This screen enhances understanding by demonstrating that shape, along with mass and volume, plays a crucial role in buoyancy and flotation behavior.
  
* Applications Screen: This screen has two different scenes: Bottle and Boat. You can fill a bottle with different materials and adjust its air volume to see how it affects buoyancy. The second scene allows you to load objects into a boat and observe how it impacts flotation. This screen emphasizes real-world applications of buoyancy concepts, demonstrating how varying the contents and structure of objects influence their interaction with the fluid.
  

## Buoyancy: Basics

* Compare Screen: See above for Buoyancy Compare Screen. This is the same implementation.
  
* Explore Screen: A simpler version of Buoyancy Explore Screen, for younger students.