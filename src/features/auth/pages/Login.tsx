//Falta tomar controle dos inputs do formulario adicionar 
//use state e criar e chamar funções externas para a 
//requisição com o banco de dados para confirma a conta e 
//transferir para a pagina de dashboard

function Login() {
    return (
        <>
            <main className="h-screen grid grid-cols-1 md:grid-cols-2  w-full">
                <section className="bg-blue-800 p-8 flex items-center justify-center">
                    <div className="">
                        <h1 className="text-white text-3xl">Sua usina, sob controle em tempo real.</h1>
                        <p className="text-gray-5q00 text-0.21xl">
                            Acompanhe geração, reservatório e equipamentos
                            com leitura clara, onde e quando precisar.
                        </p>
                    </div>
                </section>
                <section className="text-black p-8 flex items-center justify-center">
                    <form action="post" className="flex flex-col gap-2 border-[1px] p-2.5 rounded-2xl">
                        <h2>Entrar</h2>
                        <p>Acesse o painel de mmonitoramento com suas credenciais</p>
                        <label htmlFor="email">
                            <p>E-mail</p>
                            <input type="email" name="email" id="email" className="border-[1px] border-gray-400 w-[100] rounded-lg"/>
                        </label>
                        <label htmlFor="senha" className="w-[100]">
                            <p>Senha</p>
                            <input type="password" name="senha" id="senha"  className="border-[1px] border-gray-400 w-[100] rounded-lg"/>
                        </label>

                        <div className="flex justify-between">
                            <label htmlFor="conect" className="flex gap-1">
                                <input type="checkbox" name="conectado" id="conect" />
                                <p>Manter conectado</p>
                            </label>

                            <a href="#">Esqueci minha senha</a>
                        </div>

                        <input type="submit" />

                        <hr />
                        <p>
                            Acesso restrito a pessoal autorizado. Todas as ações são registradas.
                        </p>
                    </form>
                </section>
            </main>
        </>
    );
}

export default Login;