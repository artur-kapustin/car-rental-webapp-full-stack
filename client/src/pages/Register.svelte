<script>
    import Form from "../components/utils/Form.svelte";
    import {postUser} from "../components/utils/js/fetch-calls/user.js"

    let fields = [
        {
            label: 'Username',
            placeholder: 'E.g. Artur',
            type: 'text',
        },
        {
            label: 'Email',
            placeholder: 'E.g. abc@defg.com',
            type: 'email',
        },
        {
            label: 'Password',
            placeholder: 'Enter strong password',
            type: 'password',
        },
        {
            label: 'Repeat Password',
            placeholder: 'Enter same password as above',
            type: 'password',
        }];
</script>
<main class="default-main-style-128-with-bg">
    <Form formTitle="Register" fields={fields} fetchCall={async (formFields) => await postUser(formFields[0].value, formFields[1].value, formFields[2].value)} href="/sign-in"/>
</main>