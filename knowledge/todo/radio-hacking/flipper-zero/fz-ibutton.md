# FZ - iButton

## Intro

For more info about what is an iButton check:

> Related: [../ibutton.md](../ibutton.md)

## Design

The **blue** part of the following imageis how you would need to **put the real iButton** so the Flipper can **read it.** The **green** part is how you need to **touch the reader** with the Flipper zero to **correctly emulate an iButton**.

## Actions

### Read

In Read Mode Flipper is waiting for the iButton key to touch and is able to digest any of three types of keys: **Dallas, Cyfral, and Metakom**. Flipper will **figure out the type of the key itself**. The name of the key protocol will be displayed on the screen above the ID number.

### Add manually

It's possible to **add manually** an iButton of type: **Dallas, Cyfral, and Metakom**

### **Emulate**

It's possible to **emulate** saved iButtons (read or manually added).

> [!TIP]
> If you cannot make the expected contacts of the Flipper Zero touch the reader you can **use the external GPIO:**

## References

- [https://blog.flipperzero.one/taming-ibutton/](https://blog.flipperzero.one/taming-ibutton/)
