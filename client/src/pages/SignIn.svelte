<script>
    import Form from "../components/utils/Form.svelte";
    import {login} from "../components/utils/js/fetch-calls/token.js";

    let fields = [
        {
            label: 'Email',
            placeholder: 'E.g. abc@defg.com',
            type: 'email',
        },
        {
            label: 'Password',
            placeholder: 'Enter strong password',
            type: 'password',
    }];
</script>
<main class="default-main-style-128-with-bg">
    <Form formTitle="Sign in" fields={fields} fetchCall={async (formFields) => await login(formFields[0].value, formFields[1].value)} href="/"/>
    <span class="my-4 self-center">OR</span>
    <a class="default-button-style text-center w-full" href="/register">Register</a>
</main>
