// Touch UP / Touch DOWN / Touch DOWN_AND_UP
// Press UP / Press DOWN / Press DONW_AND_UP
// Type DOWN_AND_UP

// A key press starts with a key event with ACTION_DOWN. If the key is held sufficiently long that it repeats, then the initial down is followed additional key events with ACTION_DOWN and a non-zero value for getRepeatCount(). The last key event is a ACTION_UP for the key up. If the key press is canceled, the key up event will have the FLAG_CANCELED flag set.


// void drag ( tuple start, tuple end, float duration, integer steps)
// void touch ( integer x, integer y, string type)
// void press (string name, integer type)
  // name: http://developer.android.com/reference/android/view/KeyEvent.html
// void type (string message)

// object getProperty (string key)
// object shell (string cmd)

// void installPackage (string path)
// void removePackage (string package)


// void reboot (string bootloadType)
// void wake ()

// void broadcastIntent ( string uri, string action, string data, string mimetype, iterable categories dictionary extras, component component, iterable flags)

// void startActivity ( string uri, string action, string data, string mimetype, iterable categories dictionary extras, component component, iterable flags)

/* ACTIONS
- ACTION_DOWN
- ACTION_UP
- ACTION_MULTIPLE
- FLAG_CANCELED
- 


*/
