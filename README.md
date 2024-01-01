<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
  <a href="https://github.com/othneildrew/Best-README-Template"></a>
-->

<!-- PROJECT LOGO -->
<br />
<div align="center">
    <img src="public/STR_LOGIN.avif" alt="Logo" width="350" height="200">
  
  <h1 align="center">Stuff To Route??</h1>

   <p align="center">
    E-commerce backend
    <br />
    <br />
    <a href="https://stufftoroute.vercel.app" target="_blank" rel="noopener noreferrer">View Demo</a>
    ·
    <a href="https://pagespeed.web.dev/analysis/https-stufftoroute-vercel-app/7hlq5fiq11?form_factor=mobile" target="_blank" rel="noopener noreferrer">
      SEO score
    </a>
  </p>
</div>

## Website and README.md are in construction

<br/>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#usage">Usage</a>
      <ul>
      <li><a href="#about-the-project">About The Project</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>      
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## Usage

### Stripe demo payment

Use this payment method to fake a purchase: 4242 4242 4242 4242 01/28 424 22222

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Demo users

admin / 123
<br/>
user / 123

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ABOUT THE PROJECT -->

### About The Project

This backend is part of the Stuff To Route E-commerce application, designed to offer an intuitive shopping experience for specialized products for motorbikers. This backend manages store operations, including user authentication, order management, and integration with Stripe for payments.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [![Node.js][Node.img]][Node-url]
- [![Javascript][Javascript.img]][Javascript-url]
- [![Express.js][Express.img]][Express-url]
- [![Mongoose][Mongoose.img]][Mongoose-url]
- [![Swagger][Swagger.img]][Swagger-url]
- [![Stripe][Stripe.img]][Stripe-url]
- [![JsonWebToken][JsonWebToken.img]][JsonWebToken-url]
- [![Nodemailer][Nodemailer.img]][Nodemailer-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

To get started with this project, follow the steps below:

### Installation

Follow these instructions to clone and set up the application on your local machine:

1. Clone the repository
   ```sh
   git clone https://github.com/BertoPolo/capstone-backend.git
   ```
2. Create an account in https://cloudinary.com/

3. Install NPM packages
   ```sh
   npm install
   ```
4. Set your .env file with these variables

```sh
PORT= ( Your port number)
MONGO_CONNECTION= ( Database URL)
CLOUDINARY_URL= ( Cloudinary URL)
JWT_SECRET= ( Complex string)
USER= ( sender´s email id )
PASS= (Email´s password )
FE_DEV_URL=
FE_PROD_URL=
FE_PROD_BACKOFFICE_URL= (URL for backoffice project)
MYMAIL=
SECRET_STRIPE_KEY=
```

5. Run

```sh
npm run dev
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

<!--
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

-->
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

[![LinkedIn][linkedin-img]][linkedin-url] - bertopolo91@gmail.com

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

<!--
Use this space to list resources you find helpful and would like to give credit to. I've included a few of my favorites to kick things off!
-->
<ol>
  
<li> <a href="">Node.js</a></li>  
<li><a href="https://expressjs.com/">Express.js</a></li>
<li><a href="">MongoDB</a></li>
<li><a href="https://www.npmjs.com/package/jsonwebtoken">JSON Web Token</a></li>
<li><a href="https://nodemailer.com/">Nodemailer</a></li>

</ol>

<palign="right">(<a href="#readme-top">back to top</a>)</palign=>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/bertopolo
[linkedin-img]: https://img.shields.io/badge/Bertopolo-blue?logo=linkedin
[Javascript.img]: https://img.shields.io/badge/Javascript-blue?logo=javascript
[Javascript-url]: https://javascript.com
[Express.img]: https://img.shields.io/badge/Express-blue?logo=express
[Express-url]: https://expressjs.com/
[Mongoose.img]: https://img.shields.io/badge/Mongoose-blue?logo=mongoose
[Mongoose-url]: https://mongoosejs.com/
[Swagger.img]: https://img.shields.io/badge/Swagger-blue?logo=swagger
[Swagger-url]: https://swagger.io/
[Stripe.img]: https://img.shields.io/badge/Stripe-blue?logo=stripe
[Stripe-url]: https://stripe.com/
[JsonWebToken.img]: https://img.shields.io/badge/JsonWebToken-blue?logo=jsonwebtoken
[JsonWebToken-url]: https://www.npmjs.com/package/jsonwebtoken
[Nodemailer.img]: https://img.shields.io/badge/Nodemailer-blue?logo=nodemailer
[Nodemailer-url]: https://nodemailer.com/

<!--
[Node-img]:
[Node-url]:
[MongoDB-img]:
[MongoDB-url]:
-->
