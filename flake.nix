{
  description = "A very simple flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs?rev=6a323903ad07de6680169bb0423c5cea9db41d82";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        compiler = "ghc8107";

        pkgs = nixpkgs.legacyPackages.${system};

        haskellPackages = pkgs.haskell.packages.${compiler};

        jailbreakUnbreak = pkg:
          pkgs.haskell.lib.doJailbreak (pkg.overrideAttrs (_: { meta = { }; }));

        # DON'T FORGET TO PUT YOUR PACKAGE NAME HERE, REMOVING `throw`
        # packageName = "mlabs-internship-program-week2";
      in {
        # packages.${packageName} =
        #   haskellPackages.callCabal2nix packageName self rec {
        #     # Dependency overrides go here
        #   };

        # defaultPackage = self.packages.${system}.${packageName};

        devShell = pkgs.mkShell {
          buildInputs = with haskellPackages; [
            # haskell-language-server
            # ghcid
            # ghc
            # cabal-install
            # hlint
            # apply-refact
            # hie-bios
            # cabal2nix
            pkgs.nodejs
          ];
          # inputsFrom = builtins.attrValues self.packages.${system};
        };
      });
}
