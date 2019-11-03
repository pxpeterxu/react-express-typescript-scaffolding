import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faCheckSquare } from '@fortawesome/free-regular-svg-icons';

// This imports all the FontAwesome SVG information that we need to use
// If you want to use an additional icon, you must add it to the imports and
// to the `library.add` call below
library.add(faArrowLeft, faCheckSquare, faFacebook);
