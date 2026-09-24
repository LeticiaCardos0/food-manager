package com.superdev.foodmanager.controllers;

import com.superdev.foodmanager.dtos.produto.ProdutoAtualizarDto;
import com.superdev.foodmanager.dtos.produto.ProdutoCriarDto;
import com.superdev.foodmanager.models.Produto;
import com.superdev.foodmanager.services.ProdutoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/produtos")

public class ProdutoController {
    private final ProdutoService service;

    public ProdutoController(ProdutoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Produto> listar(){
        return service.listar();
    }

    @PostMapping
    public Produto criar(@RequestBody @Valid ProdutoCriarDto dto){
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public Produto atualizar(@PathVariable int id,
       @RequestBody @Valid ProdutoAtualizarDto dto){
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public Produto apagar(@PathVariable int id){
        return service.apagar(id);
    }

    @GetMapping("/{id}")
    public Produto obterPorId(@PathVariable int id){
        return service.obterPorId(id);
    }

}
