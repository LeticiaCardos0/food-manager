package com.superdev.foodmanager.services;

import com.superdev.foodmanager.dtos.cliente.ClienteAtualizarDto;
import com.superdev.foodmanager.dtos.cliente.ClienteCriarDto;
import com.superdev.foodmanager.models.Cliente;
import com.superdev.foodmanager.repositories.ClienteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class ClienteService {
    private final ClienteRepository repository;

    public ClienteService(ClienteRepository repository) {
        this.repository = repository;
    }

    public List<Cliente> listar(){
        return this.repository.findAll();
    }

    public Cliente criar(ClienteCriarDto dado){
        var cliente = Cliente.builder()
                .nome(dado.nome())
                .email(dado.email())
                .telefone(dado.telefone())
                .cpf(dado.cpf())
                .endereco(dado.endereco())
                .ativo(dado.ativo() != null ? dado.ativo() : true)
                .dataCadastro(dado.dataCadastro() != null ? dado.dataCadastro() : LocalDate.now())
                .build();

        return this.repository.save(cliente);
    }

    public Cliente atualizar(int id, ClienteAtualizarDto dado){
        var cliente = buscarOuFalhar(id);
        cliente.setNome(dado.nome());
        cliente.setEmail(dado.email());
        cliente.setTelefone(dado.telefone());
        cliente.setCpf(dado.cpf());
        cliente.setEndereco(dado.endereco());
        if (dado.ativo() != null) cliente.setAtivo(dado.ativo());
        if (dado.dataCadastro() != null) cliente.setDataCadastro(dado.dataCadastro());
        return repository.save(cliente);
    }

    public Cliente apagar(int id){
        var cliente = repository.findById(id).orElseThrow();

        cliente.setAtivo(false);
        return repository.save(cliente);
    }

    public Cliente obterPorId(int id){
        return buscarOuFalhar(id);
    }

    private Cliente buscarOuFalhar(int id){
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));
    }
}