const host = process.env.NODE_ENV === 'development' ? 'http://localhost:7001' : window.location.origin;

function getCookie(name) {
  const nameEQ = name + "=";
  const cookiesArray = document.cookie.split(';');

  for (let i = 0; i < cookiesArray.length; i++) {
    let cookie = cookiesArray[i];

    // Remove leading spaces
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }

    // Check if the cookie starts with the name we want
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }

  return null; // Cookie not found
}

function POST(url, body, callabck) {

  fetch(host + url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : null,
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': localStorage.getItem('token')
      'Authorization': getCookie('token')
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      callabck(data);
    })
    .catch(error => {
      callabck(false);
    });
}

export const login = function (form, callabck) {
  POST('/login', form, function (result) {
    callabck(result);
  });
}

export const logout = function (callabck) {
  POST('/logout', false, function (result) {
    callabck(result);
  });
}

export const upload = function (form, callabck) {
  POST('/upload', form, function (result) {
    callabck(result);
  });
}

export const getStyle = function (classname, callabck) {
  POST('/get/style/' + classname, false, function (result) {
    callabck(result);
  });
}

export const getType = function (style_id, callabck) {
  POST('/get/type/' + style_id, false, function (result) {
    callabck(result);
  });
}

export const getClass = function (style_id, callabck) {
  POST('/get/class/' + style_id, false, function (result) {
    callabck(result);
  });
}

export const getName = function (style_id, name, callabck) {
  POST('/get/name/' + style_id + '/' + name, false, function (result) {
    callabck(result);
  });
}

export const list = function (style, version, type, callabck) {
  POST('/list/' + style + '/' + version + '/' + type, false, function (result) {
    callabck(result);
  });
}

export const manager = function (name, callabck) {
  POST('/manager/' + name, false, function (result) {
    callabck(result);
  });
}

export const update = function (url, form, callabck) {
  POST('/manager/' + url, form, function (result) {
    callabck(result);
  });
}

export const add = function (url, form, callabck) {
  POST('/manager/' + url, form, function (result) {
    callabck(result);
  });
}

export const addClassname = function (name, form, callabck) {
  POST('/manager/class/' + name, form, function (result) {
    callabck(result);
  });
}

export const updateClassname = function (name, form, callabck) {
  POST('/manager/class/' + name, form, function (result) {
    callabck(result);
  });
}

export const getClassname = function (name, form, callabck) {
  POST('/manager/class/' + name, form, function (result) {
    callabck(result);
  });
}

export const updateDoorStair = function (form, callabck) {
  POST('/update-door-stair', form, function (result) {
    callabck(result);
  });
}